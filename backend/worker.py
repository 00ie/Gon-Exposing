from __future__ import annotations

import asyncio
import os
from pathlib import Path

from backend.celery_app import celery_app
from backend.services.analysis_pipeline import analyze_sample_from_disk
from backend.services.safety import delete_file_quietly, should_delete_upload_after_analysis
from backend.services.scan_index_factory import build_scan_index
from backend.services.store import AnalysisStore


def _build_store() -> AnalysisStore:
    base_dir = Path(__file__).resolve().parent
    data_dir = base_dir / "data"
    results_dir = Path(os.getenv("RESULTS_DIR_PATH", str(data_dir / "results")))
    scan_index_db = Path(os.getenv("SCAN_INDEX_DB_PATH", str(data_dir / "scans.db")))
    scan_index = build_scan_index(scan_index_db)
    return AnalysisStore(results_dir, scan_index=scan_index)


@celery_app.task(name="backend.worker.analyze_file")
def analyze_file(task_id: str, filename: str, source_path: str) -> None:
    store = _build_store()
    try:
        asyncio.run(analyze_sample_from_disk(task_id, filename, source_path, store))
    finally:
        if should_delete_upload_after_analysis():
            delete_file_quietly(source_path)
