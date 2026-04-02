from __future__ import annotations

import os

from fastapi import BackgroundTasks

from backend.services.analysis_pipeline import analyze_sample
from backend.services.store import AnalysisStore


def is_celery_enabled() -> bool:
    return os.getenv("ENABLE_CELERY", "false").lower() == "true"


def enqueue_analysis(
    background_tasks: BackgroundTasks,
    *,
    task_id: str,
    filename: str,
    content: bytes,
    source_path: str,
    store: AnalysisStore,
) -> str:
    if is_celery_enabled():
        try:
            from backend.worker import analyze_file

            analyze_file.delay(task_id, filename, source_path)
            return "celery"
        except Exception:
            pass

    background_tasks.add_task(analyze_sample, task_id, filename, content, store)
    return "local"
