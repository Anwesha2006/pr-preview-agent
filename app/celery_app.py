import logging
from celery import Celery
from celery.signals import setup_logging

from app.config import REDIS_URL
from app.logging_config import setup_logging as configure_app_logging


celery_app = Celery(
    "pr_review_agent",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["app.tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    worker_prefetch_multiplier=1,
    task_track_started=True
)


@setup_logging.connect
def configure_celery_logging(**kwargs):
    configure_app_logging()
