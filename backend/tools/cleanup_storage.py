from __future__ import annotations

import argparse
import os
from datetime import datetime, timedelta
from pathlib import Path


def resolve_data_dir() -> Path:
    return Path(__file__).resolve().parent.parent / "data"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(prog="cleanup_storage", description="Limpa uploads e resultados locais do Gon Exposing.")
    parser.add_argument("--target", choices=["uploads", "results", "all"], default="uploads")
    parser.add_argument("--older-than-days", type=int, default=0)
    parser.add_argument("--dry-run", action="store_true")
    return parser.parse_args()


def should_delete(path: Path, cutoff: datetime | None) -> bool:
    if cutoff is None:
        return True
    modified = datetime.fromtimestamp(path.stat().st_mtime)
    return modified < cutoff


def cleanup_directory(path: Path, cutoff: datetime | None, dry_run: bool) -> tuple[int, int]:
    if not path.exists():
        return 0, 0

    files = [item for item in path.iterdir() if item.is_file()]
    deleted = 0
    freed_bytes = 0

    for file_path in files:
        if not should_delete(file_path, cutoff):
            continue
        size = file_path.stat().st_size
        if not dry_run:
            file_path.unlink(missing_ok=True)
        deleted += 1
        freed_bytes += size

    return deleted, freed_bytes


def format_bytes(size: int) -> str:
    units = ["B", "KB", "MB", "GB"]
    value = float(size)
    for unit in units:
        if value < 1024 or unit == units[-1]:
            return f"{value:.1f} {unit}"
        value /= 1024
    return f"{size} B"


def main() -> int:
    args = parse_args()
    data_dir = resolve_data_dir()
    uploads_dir = Path(os.getenv("UPLOAD_DIR_PATH", str(data_dir / "uploads")))
    results_dir = Path(os.getenv("RESULTS_DIR_PATH", str(data_dir / "results")))
    cutoff = None if args.older_than_days <= 0 else datetime.now() - timedelta(days=args.older_than_days)

    total_deleted = 0
    total_freed = 0

    targets: list[Path] = []
    if args.target in {"uploads", "all"}:
        targets.append(uploads_dir)
    if args.target in {"results", "all"}:
        targets.append(results_dir)

    for target in targets:
        deleted, freed = cleanup_directory(target, cutoff, args.dry_run)
        total_deleted += deleted
        total_freed += freed
        print(f"{target}: {deleted} arquivo(s), {format_bytes(freed)}")

    action = "simulada" if args.dry_run else "concluida"
    print(f"Limpeza {action}. Total: {total_deleted} arquivo(s), {format_bytes(total_freed)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
