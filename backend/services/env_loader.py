from __future__ import annotations

import os
from pathlib import Path


def _parse_env_file(file_path: Path) -> dict[str, str]:
    parsed: dict[str, str] = {}

    for raw_line in file_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue

        if line.startswith("export "):
            line = line[7:].strip()

        if "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip()

        if not key:
            continue

        if len(value) >= 2 and value[0] == value[-1] and value[0] in {'"', "'"}:
            value = value[1:-1]

        parsed[key] = value

    return parsed


def load_project_env() -> None:
    project_root = Path(__file__).resolve().parents[2]
    search_roots = [project_root, Path.cwd()]
    seen: set[Path] = set()

    for root in search_roots:
        for filename in (".env.local", ".env", ".env.example"):
            candidate = root / filename
            if candidate in seen or not candidate.is_file():
                continue

            seen.add(candidate)

            for key, value in _parse_env_file(candidate).items():
                os.environ.setdefault(key, value)
