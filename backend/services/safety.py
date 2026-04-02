from __future__ import annotations

import os
import re
from pathlib import Path


SAFE_FILENAME_PATTERN = re.compile(r"[^A-Za-z0-9._-]+")


def sanitize_filename(filename: str) -> str:
    candidate = Path(filename or "sample.bin").name.strip()
    if not candidate:
        candidate = "sample.bin"

    candidate = SAFE_FILENAME_PATTERN.sub("_", candidate)
    candidate = candidate.strip("._") or "sample.bin"
    return candidate[:120]


def static_analysis_policy() -> dict[str, object]:
    return {
        "mode": "static_only",
        "sample_execution": False,
        "sample_retention": os.getenv("DELETE_UPLOAD_AFTER_ANALYSIS", "true").lower() != "true",
        "worker_disk_usage": os.getenv("ENABLE_CELERY", "false").lower() == "true",
    }


def should_delete_upload_after_analysis() -> bool:
    return os.getenv("DELETE_UPLOAD_AFTER_ANALYSIS", "true").lower() == "true"


def delete_file_quietly(file_path: str | Path | None) -> None:
    if not file_path:
        return

    try:
        Path(file_path).unlink(missing_ok=True)
    except Exception:
        return
