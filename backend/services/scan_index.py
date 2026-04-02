from __future__ import annotations

import json
import sqlite3
import threading
from pathlib import Path

from backend.models.schemas import ScanSummary, StoredTask


class ScanIndexService:
    def __init__(self, database_path: Path):
        self.database_path = database_path
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = threading.Lock()
        self._initialize()

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.database_path)
        connection.row_factory = sqlite3.Row
        return connection

    def _initialize(self) -> None:
        with self._connect() as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS scans (
                    task_id TEXT PRIMARY KEY,
                    status TEXT NOT NULL,
                    source_name TEXT NOT NULL,
                    file_type TEXT,
                    score INTEGER,
                    classification TEXT,
                    family TEXT,
                    owner_user_id TEXT,
                    owner_email TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    payload_json TEXT
                )
                """
            )
            connection.commit()

    def upsert_task(self, task: StoredTask) -> None:
        result = task.result
        with self._lock, self._connect() as connection:
            connection.execute(
                """
                INSERT INTO scans (
                    task_id, status, source_name, file_type, score, classification, family,
                    owner_user_id, owner_email, created_at, updated_at, payload_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(task_id) DO UPDATE SET
                    status=excluded.status,
                    source_name=excluded.source_name,
                    file_type=excluded.file_type,
                    score=excluded.score,
                    classification=excluded.classification,
                    family=excluded.family,
                    owner_user_id=excluded.owner_user_id,
                    owner_email=excluded.owner_email,
                    updated_at=excluded.updated_at,
                    payload_json=excluded.payload_json
                """,
                (
                    task.task_id,
                    task.status,
                    task.source_name,
                    result.file.type if result and result.file else None,
                    result.score.value if result and result.score else None,
                    result.score.classification if result and result.score else None,
                    result.family.name if result and result.family else None,
                    task.owner_user_id,
                    task.owner_email,
                    task.created_at,
                    task.updated_at,
                    json.dumps(result.model_dump(mode="json")) if result else None,
                ),
            )
            connection.commit()

    def list_recent(self, limit: int = 20, owner_user_id: str | None = None) -> list[ScanSummary]:
        query = """
            SELECT task_id, status, source_name, file_type, score, classification, family, created_at, owner_email, payload_json
            FROM scans
        """
        params: list[object] = []
        if owner_user_id:
            query += " WHERE owner_user_id = ?"
            params.append(owner_user_id)
        query += " ORDER BY updated_at DESC LIMIT ?"
        params.append(limit)

        with self._connect() as connection:
            rows = connection.execute(query, params).fetchall()
        return self._rows_to_summaries(rows)

    def list_public(self, limit: int = 20, query: str | None = None) -> list[ScanSummary]:
        sql = """
            SELECT task_id, status, source_name, file_type, score, classification, family, created_at, owner_email, payload_json
            FROM scans
            WHERE status = ?
              AND classification IN (?, ?)
        """
        params: list[object] = ["complete", "HIGH", "CRITICAL"]

        normalized = (query or "").strip()
        if normalized:
            wildcard = f"%{normalized}%"
            sql += """
              AND (
                source_name LIKE ?
                OR task_id LIKE ?
                OR family LIKE ?
                OR payload_json LIKE ?
              )
            """
            params.extend([wildcard, wildcard, wildcard, wildcard])

        sql += " ORDER BY updated_at DESC LIMIT ?"
        params.append(limit)

        with self._connect() as connection:
            rows = connection.execute(sql, params).fetchall()

        return self._rows_to_summaries(rows, include_owner_email=False)

    def search(self, query: str, limit: int = 20, owner_user_id: str | None = None) -> list[ScanSummary]:
        normalized = query.strip()
        if not normalized:
            return []

        sql = """
            SELECT task_id, status, source_name, file_type, score, classification, family, created_at, owner_email, payload_json
            FROM scans
            WHERE (
                source_name LIKE ?
                OR task_id LIKE ?
                OR family LIKE ?
                OR payload_json LIKE ?
            )
        """
        wildcard = f"%{normalized}%"
        params: list[object] = [wildcard, wildcard, wildcard, wildcard]

        if owner_user_id:
            sql += " AND owner_user_id = ?"
            params.append(owner_user_id)

        sql += " ORDER BY updated_at DESC LIMIT ?"
        params.append(limit)

        with self._connect() as connection:
            rows = connection.execute(sql, params).fetchall()

        return self._rows_to_summaries(rows)

    def find_task_id_by_hash(self, hash_value: str, owner_user_id: str | None = None) -> str | None:
        normalized = hash_value.strip().lower()
        if not normalized:
            return None

        sql = """
            SELECT task_id, payload_json
            FROM scans
            WHERE payload_json LIKE ?
        """
        params: list[object] = [f"%{normalized}%"]

        if owner_user_id:
            sql += " AND owner_user_id = ?"
            params.append(owner_user_id)

        sql += " ORDER BY updated_at DESC"

        with self._connect() as connection:
            rows = connection.execute(sql, params).fetchall()

        for row in rows:
            payload_json = row["payload_json"]
            if not payload_json:
                continue

            try:
                payload = json.loads(payload_json)
            except json.JSONDecodeError:
                continue

            file_payload = payload.get("file") or {}
            hashes = {
                str(file_payload.get("md5") or "").lower(),
                str(file_payload.get("sha1") or "").lower(),
                str(file_payload.get("sha256") or "").lower(),
                str(file_payload.get("sha512") or "").lower(),
            }

            if normalized in hashes:
                return str(row["task_id"])

        return None

    def _rows_to_summaries(self, rows: list[sqlite3.Row], include_owner_email: bool = True) -> list[ScanSummary]:
        summaries: list[ScanSummary] = []
        for row in rows:
            file_hash: str | None = None
            if row["payload_json"]:
                try:
                    payload = json.loads(row["payload_json"])
                except json.JSONDecodeError:
                    payload = {}
                file_hash = ((payload.get("file") or {}).get("sha256"))

            summaries.append(
                ScanSummary(
                    task_id=row["task_id"],
                    status=row["status"],
                    file_name=row["source_name"],
                    file_type=row["file_type"],
                    file_hash=file_hash,
                    score=row["score"],
                    classification=row["classification"],
                    family=row["family"],
                    created_at=row["created_at"],
                    owner_email=row["owner_email"] if include_owner_email else None,
                )
            )

        return summaries
