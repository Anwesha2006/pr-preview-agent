import hashlib
import hmac
import json
from app.tasks import review_pr_task
from fastapi import APIRouter, Request, HTTPException

from app.config import WEBHOOK_SECRET

router = APIRouter()


@router.post("/webhooks/github")
async def github_webhook(request: Request):

    if not WEBHOOK_SECRET:
        raise HTTPException(
            status_code=500,
            detail="Webhook secret is not configured"
        )

    body = await request.body()

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

    event = request.headers.get("X-GitHub-Event")

    payload = json.loads(body)

    if event == "pull_request":

        action = payload.get("action")

        if action == "opened":

            repository = payload.get(
                "repository", {}
            ).get("full_name")

            pr_number = payload.get("number")

            if not repository or not pr_number:
                raise HTTPException(
                    status_code=400,
                    detail="Missing repository or PR number"
                )

            # Extract repository owner and name
            owner, repo = repository.split("/", 1)

            print("New Pull Request detected!")
            print("Repository:", repository)
            print("PR Number:", pr_number)

            # Submit background task to Redis
            task = review_pr_task.delay(
                owner,
                repo,
                pr_number
            )

            print("Review task queued!")
            print("Task ID:", task.id)

            return {
                "message": "PR review task queued successfully",
                "repository": repository,
                "pr_number": pr_number,
                "task_id": task.id
            }

    return {
        "message": "Webhook received",
        "event": event
    }