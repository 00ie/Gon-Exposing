from __future__ import annotations

import asyncio
import json
from datetime import UTC, datetime
from pathlib import Path

from backend.models.schemas import ScanSummary, StoredTask
from backend.services.scan_index import ScanIndexService


class AnalysisStore:
    def __init__(self, root: Path, scan_index: ScanIndexService | None = None):
        self.root = root
        self.root.mkdir(parents=True, exist_ok=True)
        self._lock = asyncio.Lock()
        self._tasks: dict[str, StoredTask] = {}
        self.scan_index = scan_index

    async def create(self, task: StoredTask) -> None:
        async with self._lock:
            self._tasks[task.task_id] = task
            await self._persist(task)
            self._sync_index(task)

    async def get(self, task_id: str) -> StoredTask | None:
        task = self._tasks.get(task_id)
        if task:
            return task

        file_path = self.root / f"{task_id}.json"
        if not file_path.exists():
            return None

        payload = json.loads(file_path.read_text(encoding="utf-8"))
        task = StoredTask.model_validate(payload)
        self._tasks[task_id] = task
        return task

    async def save(self, task: StoredTask) -> None:
        async with self._lock:
            task.updated_at = utc_now()
            self._tasks[task.task_id] = task
            await self._persist(task)
            self._sync_index(task)

    async def list_recent(self, limit: int = 20, owner_user_id: str | None = None) -> list[ScanSummary]:
        if self.scan_index:
            return await asyncio.to_thread(self.scan_index.list_recent, limit, owner_user_id)

        async with self._lock:
            file_paths = sorted(self.root.glob("*.json"), key=lambda item: item.stat().st_mtime, reverse=True)

        summaries: list[ScanSummary] = []
        for file_path in file_paths:
            payload = json.loads(file_path.read_text(encoding="utf-8"))
            task = StoredTask.model_validate(payload)
            if owner_user_id and task.owner_user_id != owner_user_id:
                continue

            summaries.append(
                ScanSummary(
                    task_id=task.task_id,
                    status=task.status,
                    file_name=task.source_name,
                    file_type=task.result.file.type if task.result and task.result.file else None,
                    score=task.result.score.value if task.result and task.result.score else None,
                    classification=task.result.score.classification if task.result and task.result.score else None,
                    family=task.result.family.name if task.result and task.result.family else None,
                    created_at=task.created_at,
                    owner_email=task.owner_email,
                )
            )
            if len(summaries) >= limit:
                break

        return summaries

    async def search(self, query: str, limit: int = 20, owner_user_id: str | None = None) -> list[ScanSummary]:
        if self.scan_index:
            return await asyncio.to_thread(self.scan_index.search, query, limit, owner_user_id)

        recent = await self.list_recent(limit=200, owner_user_id=owner_user_id)
        normalized = query.strip().lower()
        if not normalized:
            return []

        matches = [
            item for item in recent
            if normalized in item.file_name.lower()
            or normalized in item.task_id.lower()
            or normalized in (item.family or "").lower()
            or normalized in (item.file_hash or "").lower()
        ]
        return matches[:limit]

    async def list_public(self, limit: int = 20, query: str | None = None) -> list[ScanSummary]:
        if self.scan_index and hasattr(self.scan_index, "list_public"):
            return await asyncio.to_thread(self.scan_index.list_public, limit, query)

        recent = await self.list_recent(limit=500)
        normalized = (query or "").strip().lower()
        matches = [
            item for item in recent
            if item.status == "complete" and item.classification in {"HIGH", "CRITICAL"}
        ]

        if normalized:
            matches = [
                item for item in matches
                if normalized in item.file_name.lower()
                or normalized in item.task_id.lower()
                or normalized in (item.family or "").lower()
                or normalized in (item.file_hash or "").lower()
            ]

        return [
            ScanSummary(
                task_id=item.task_id,
                status=item.status,
                file_name=item.file_name,
                file_type=item.file_type,
                file_hash=item.file_hash,
                score=item.score,
                classification=item.classification,
                family=item.family,
                created_at=item.created_at,
                owner_email=None,
            )
            for item in matches[:limit]
        ]

    async def find_task_id_by_hash(self, hash_value: str, owner_user_id: str | None = None) -> str | None:
        if self.scan_index:
            return await asyncio.to_thread(self.scan_index.find_task_id_by_hash, hash_value, owner_user_id)

        normalized = hash_value.strip().lower()
        if not normalized:
            return None

        async with self._lock:
            file_paths = list(self.root.glob("*.json"))

        for file_path in file_paths:
            payload = json.loads(file_path.read_text(encoding="utf-8"))
            task = StoredTask.model_validate(payload)
            if owner_user_id and task.owner_user_id != owner_user_id:
                continue

            file_payload = task.result.file if task.result and task.result.file else None
            if not file_payload:
                continue

            hashes = {
                file_payload.md5.lower(),
                file_payload.sha1.lower(),
                file_payload.sha256.lower(),
                file_payload.sha512.lower(),
            }
            if normalized in hashes:
                return task.task_id

        return None

    async def _persist(self, task: StoredTask) -> None:
        file_path = self.root / f"{task.task_id}.json"
        payload = task.model_dump(mode="json")
        await asyncio.to_thread(file_path.write_text, json.dumps(payload, indent=2), "utf-8")

    def _sync_index(self, task: StoredTask) -> None:
        if not self.scan_index:
            return
        self.scan_index.upsert_task(task)


def utc_now() -> str:
    return datetime.now(UTC).isoformat()
