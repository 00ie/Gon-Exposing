from __future__ import annotations

import os
from pathlib import Path

from backend.services.auth import AuthService
from backend.services.auth_postgres import PostgresAuthService


def build_auth_service(default_sqlite_path: Path):
    database_url = os.getenv("DATABASE_URL", "").strip()
    if database_url.startswith("postgresql://") or database_url.startswith("postgres://"):
        try:
            return PostgresAuthService(database_url)
        except Exception:
            return AuthService(default_sqlite_path)
    return AuthService(default_sqlite_path)
