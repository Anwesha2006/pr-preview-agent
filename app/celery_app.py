
import logging
import ssl

from celery import Celery
from celery.signals import setup_logging

from app.config import REDIS_URL
from app.logging_config import setup_logging as configure_app_logging


redis_ssl_options = {}

if REDIS_URL.startswith("rediss://"):
    redis_ssl_options = {
        "ssl_cert_reqs": ssl.CERT_REQUIRED
    }


celery_app = Celery(
    "pr_review_agent",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["app.tasks"]
)

celery_app.conf.update(
    broker_use_ssl=redis_ssl_options,
    redis_backend_use_ssl=redis_ssl_options,

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
