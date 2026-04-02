from __future__ import annotations

import os

from celery import Celery

from backend.services.env_loader import load_project_env


load_project_env()


celery_app = Celery(
    "gon_exposing",
    broker=os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0"),
    backend=os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/1"),
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    task_track_started=True,
    broker_connection_retry_on_startup=True,
)

celery_app.autodiscover_tasks(["backend"])
