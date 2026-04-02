from __future__ import annotations

import os
from pathlib import Path

from backend.services.scan_index import ScanIndexService
from backend.services.scan_index_postgres import PostgresScanIndexService


def build_scan_index(default_sqlite_path: Path):
    database_url = os.getenv("DATABASE_URL", "").strip()
    if database_url.startswith("postgresql://") or database_url.startswith("postgres://"):
        try:
            return PostgresScanIndexService(database_url)
        except Exception:
            return ScanIndexService(default_sqlite_path)
    return ScanIndexService(default_sqlite_path)
