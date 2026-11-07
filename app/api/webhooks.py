
import hashlib
import hmac
import json
import logging
import redis

from fastapi import APIRouter, Request, HTTPException

from app.config import WEBHOOK_SECRET,REDIS_URL
from app.tasks import review_pr_task

router = APIRouter()
logger = logging.getLogger(__name__)

MAX_WEBHOOK_SIZE = 1 * 1024 * 1024  # 1 MB

redis_client = redis.Redis.from_url(
    REDIS_URL,
    decode_responses=True
)

def is_duplicate_delivery(delivery_id: str) -> bool:
    key = f"github_delivery:{delivery_id}"

    is_new = redis_client.set(
        key,
        "processed",
        nx=True,
        ex=86400
    )

    return not is_new


@router.post("/webhooks/github")
async def github_webhook(request: Request):

    if not WEBHOOK_SECRET:
        logger.error("GitHub webhook secret is not configured")
        raise HTTPException(
            status_code=500,
            detail="Webhook secret is not configured"
        )

    # Check declared request size.
    content_length = request.headers.get("content-length")

    if content_length:
        try:
            if int(content_length) < 0:
                raise ValueError("Negative Content-Length")

            if int(content_length) > MAX_WEBHOOK_SIZE:
                raise HTTPException(
                    status_code=413,
                    detail="Webhook payload too large"
                )

        except ValueError as error:
            raise HTTPException(
                status_code=400,
                detail="Invalid Content-Length"
            ) from error

    # Read and verify actual request size.
    body = await request.body()

    if len(body) > MAX_WEBHOOK_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Webhook payload too large"
        )

    delivery_id = request.headers.get(
        "X-GitHub-Delivery",
        "unknown"
    )
    event = request.headers.get("X-GitHub-Event")

    logger.info(
        "GitHub webhook received: delivery_id=%s event=%s",
        delivery_id,
        event
    )

    # Verify GitHub signature.
    signature = request.headers.get("X-Hub-Signature-256")

    if not signature:
        raise HTTPException(
            status_code=401,
            detail="Missing signature"
        )

    expected_signature = "sha256=" + hmac.new(
        WEBHOOK_SECRET.encode("utf-8"),
        body,
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(expected_signature, signature):
        logger.warning(
            "Invalid webhook signature: delivery_id=%s",
            delivery_id
        )
        raise HTTPException(
            status_code=401,
            detail="Invalid signature"
        )

    logger.info(
        "Webhook signature verified: delivery_id=%s",
        delivery_id
    )

    # Parse JSON payload.
    try:
        payload = json.loads(body)

    except (json.JSONDecodeError, UnicodeDecodeError) as error:
        raise HTTPException(
            status_code=400,
            detail="Invalid JSON payload"
        ) from error

    if not isinstance(payload, dict):
        raise HTTPException(
            status_code=400,
            detail="Webhook payload must be a JSON object"
        )

    action = payload.get("action")

    logger.info(
        "GitHub event identified: event=%s action=%s delivery_id=%s",
        event,
        action,
        delivery_id
    )

    # Process relevant pull request events.
    if event == "pull_request":

        if action not in {"opened", "synchronize"}:
            logger.info(
                "Ignoring pull request action: %s",
                action
            )
            return {
                "message": "Webhook ignored",
                "event": event,
                "action": action
            }

        repository_data = payload.get("repository") or {}

        if not isinstance(repository_data, dict):
            raise HTTPException(
                status_code=400,
                detail="Invalid repository data"
            )

        repository = repository_data.get("full_name")
        owner_data = repository_data.get("owner") or {}

        if not isinstance(owner_data, dict):
            raise HTTPException(
                status_code=400,
                detail="Invalid repository owner"
            )

        owner = owner_data.get("login")
        repo = repository_data.get("name")

        if (
            (not owner or not repo)
            and isinstance(repository, str)
            and "/" in repository
        ):
            owner, repo = repository.split("/", 1)

        pr_number = payload.get("number")

        if (
            not isinstance(owner, str)
            or not owner
            or not isinstance(repo, str)
            or not repo
            or not isinstance(pr_number, int)
            or isinstance(pr_number, bool)
            or pr_number <= 0
        ):
            raise HTTPException(
                status_code=400,
                detail="Missing or invalid repository owner, name, or PR number"
            )

        # Prevent duplicate deliveries.
        if delivery_id != "unknown" and is_duplicate_delivery(delivery_id):
            logger.info(
                "Duplicate webhook delivery ignored: delivery_id=%s",
                delivery_id
            )
            return {
                "message": "Duplicate webhook delivery ignored",
                "delivery_id": delivery_id
            }

        # Queue background review.
        try:
            task = review_pr_task.delay(owner, repo, pr_number)

        except Exception:
            # Allow GitHub to retry if queuing fails.
            if delivery_id != "unknown":
                redis_client.delete(f"github_delivery:{delivery_id}")
            logger.exception("Failed to queue PR review task")
            raise HTTPException(
                status_code=503,
                detail="Could not queue PR review task"
            )

        logger.info(
            "Celery review task queued: task_id=%s repository=%s/%s pr=%s delivery_id=%s",
            task.id,
            owner,
            repo,
            pr_number,
            delivery_id
        )

        return {
            "message": "PR review task queued successfully",
            "repository": f"{owner}/{repo}",
            "pr_number": pr_number,
            "task_id": task.id
        }

    return {
        "message": "Webhook received",
        "event": event
    }
