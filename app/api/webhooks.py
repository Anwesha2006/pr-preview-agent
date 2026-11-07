import hashlib
import hmac
import json
import logging
from app.tasks import review_pr_task
from fastapi import APIRouter, Request, HTTPException

from app.config import WEBHOOK_SECRET

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/webhooks/github")
async def github_webhook(request: Request):

    if not WEBHOOK_SECRET:
        raise HTTPException(
            status_code=500,
            detail="Webhook secret is not configured"
        )

    body = await request.body()
    logger.info("GitHub webhook received")

    signature = request.headers.get(
        "X-Hub-Signature-256"
    )

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

    if not hmac.compare_digest(
        expected_signature,
        signature
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid signature"
        )

    logger.info("GitHub webhook signature verified")

    event = request.headers.get("X-GitHub-Event")
    try:
        payload = json.loads(body)
    except (json.JSONDecodeError, UnicodeDecodeError) as error:
        raise HTTPException(status_code=400, detail="Invalid JSON payload") from error

    action = payload.get("action")
    logger.info("GitHub event identified: event=%s action=%s", event, action)

    if event == "pull_request":
        if action not in {"opened", "synchronize"}:
            logger.info("Ignoring pull_request action: %s", action)
            return {"message": "Webhook ignored", "event": event, "action": action}

        repository_data = payload.get("repository") or {}
        repository = repository_data.get("full_name")
        owner = (repository_data.get("owner") or {}).get("login")
        repo = repository_data.get("name")
        if (not owner or not repo) and isinstance(repository, str) and "/" in repository:
            owner, repo = repository.split("/", 1)
        pr_number = payload.get("number")

        if not owner or not repo or not isinstance(pr_number, int) or isinstance(pr_number, bool):
            raise HTTPException(status_code=400, detail="Missing repository owner, name, or PR number")

        task = review_pr_task.delay(owner, repo, pr_number)
        logger.info("Celery review task queued: task_id=%s repository=%s/%s pr=%s", task.id, owner, repo, pr_number)
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
