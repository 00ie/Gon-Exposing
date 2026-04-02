from __future__ import annotations

import json
import threading

from backend.models.schemas import ScanSummary, StoredTask

try:
    import psycopg
    from psycopg.rows import dict_row
except Exception:
    psycopg = None
    dict_row = None


class PostgresScanIndexService:
    def __init__(self, database_url: str):
        if psycopg is None or dict_row is None:
            raise RuntimeError("psycopg is not installed")
        self.database_url = database_url
        self._lock = threading.Lock()
        self._initialize()

    def _connect(self):
        return psycopg.connect(self.database_url, row_factory=dict_row)

    def _initialize(self) -> None:
        with self._connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
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
                        payload_json JSONB
                    )
                    """
                )
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_scans_updated_at ON scans (updated_at DESC)")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_scans_owner_updated_at ON scans (owner_user_id, updated_at DESC)")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_scans_family ON scans (family)")
            connection.commit()

    def upsert_task(self, task: StoredTask) -> None:
        result = task.result
        payload_json = json.dumps(result.model_dump(mode="json")) if result else None
        with self._lock, self._connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO scans (
                        task_id, status, source_name, file_type, score, classification, family,
                        owner_user_id, owner_email, created_at, updated_at, payload_json
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb)
                    ON CONFLICT (task_id) DO UPDATE SET
                        status = EXCLUDED.status,
                        source_name = EXCLUDED.source_name,
                        file_type = EXCLUDED.file_type,
                        score = EXCLUDED.score,
                        classification = EXCLUDED.classification,
                        family = EXCLUDED.family,
                        owner_user_id = EXCLUDED.owner_user_id,
                        owner_email = EXCLUDED.owner_email,
                        updated_at = EXCLUDED.updated_at,
                        payload_json = EXCLUDED.payload_json
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
                        payload_json,
                    ),
                )
            connection.commit()

    def list_recent(self, limit: int = 20, owner_user_id: str | None = None) -> list[ScanSummary]:
        params: list[object] = []
        sql = """
            SELECT task_id, status, source_name, file_type, score, classification, family, created_at, owner_email, payload_json
            FROM scans
        """
        if owner_user_id:
            sql += " WHERE owner_user_id = %s"
            params.append(owner_user_id)
        sql += " ORDER BY updated_at DESC LIMIT %s"
        params.append(limit)

        with self._connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(sql, params)
                rows = cursor.fetchall()
        return self._rows_to_summaries(rows)

    def list_public(self, limit: int = 20, query: str | None = None) -> list[ScanSummary]:
        params: list[object] = ["complete", "HIGH", "CRITICAL"]
        sql = """
            SELECT task_id, status, source_name, file_type, score, classification, family, created_at, owner_email, payload_json
            FROM scans
            WHERE status = %s
              AND classification IN (%s, %s)
        """

        normalized = (query or "").strip()
        if normalized:
            wildcard = f"%{normalized}%"
            sql += """
              AND (
                source_name ILIKE %s
                OR task_id ILIKE %s
                OR COALESCE(family, '') ILIKE %s
                OR CAST(payload_json AS TEXT) ILIKE %s
              )
            """
            params.extend([wildcard, wildcard, wildcard, wildcard])

        sql += " ORDER BY updated_at DESC LIMIT %s"
        params.append(limit)

        with self._connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(sql, params)
                rows = cursor.fetchall()

        return self._rows_to_summaries(rows, include_owner_email=False)

    def search(self, query: str, limit: int = 20, owner_user_id: str | None = None) -> list[ScanSummary]:
        normalized = query.strip()
        if not normalized:
            return []

        wildcard = f"%{normalized}%"
        params: list[object] = [wildcard, wildcard, wildcard, wildcard]
        sql = """
            SELECT task_id, status, source_name, file_type, score, classification, family, created_at, owner_email, payload_json
            FROM scans
            WHERE (
                source_name ILIKE %s
                OR task_id ILIKE %s
                OR COALESCE(family, '') ILIKE %s
                OR CAST(payload_json AS TEXT) ILIKE %s
            )
        """
        if owner_user_id:
            sql += " AND owner_user_id = %s"
            params.append(owner_user_id)
        sql += " ORDER BY updated_at DESC LIMIT %s"
        params.append(limit)

        with self._connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(sql, params)
                rows = cursor.fetchall()
        return self._rows_to_summaries(rows)

    def find_task_id_by_hash(self, hash_value: str, owner_user_id: str | None = None) -> str | None:
        normalized = hash_value.strip().lower()
        if not normalized:
            return None

        params: list[object] = [f"%{normalized}%"]
        sql = """
            SELECT task_id, payload_json
            FROM scans
            WHERE CAST(payload_json AS TEXT) ILIKE %s
        """
        if owner_user_id:
            sql += " AND owner_user_id = %s"
            params.append(owner_user_id)
        sql += " ORDER BY updated_at DESC"

        with self._connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(sql, params)
                rows = cursor.fetchall()

        for row in rows:
            payload = row.get("payload_json") or {}
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

    def _rows_to_summaries(self, rows: list[dict], include_owner_email: bool = True) -> list[ScanSummary]:
        summaries: list[ScanSummary] = []
        for row in rows:
            payload = row.get("payload_json") or {}
            file_hash = ((payload.get("file") or {}).get("sha256"))
            summaries.append(
                ScanSummary(
                    task_id=row["task_id"],
                    status=row["status"],
                    file_name=row["source_name"],
                    file_type=row.get("file_type"),
                    file_hash=file_hash,
                    score=row.get("score"),
                    classification=row.get("classification"),
                    family=row.get("family"),
                    created_at=row["created_at"],
                    owner_email=row.get("owner_email") if include_owner_email else None,
                )
            )
        return summaries
