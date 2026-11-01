
import hashlib
import hmac
import json

from fastapi import APIRouter, Request, HTTPException

from app.config import WEBHOOK_SECRET

router = APIRouter()


@router.post("/webhooks/github")
async def github_webhook(request: Request):

    # 1. Check whether our secret is configured
    if not WEBHOOK_SECRET:
        raise HTTPException(
            status_code=500,
            detail="Webhook secret is not configured"
        )

    # 2. Read the original request body
    body = await request.body()

    # 3. Get GitHub's signature
    signature = request.headers.get(
        "X-Hub-Signature-256"
    )

    if not signature:
        raise HTTPException(
            status_code=401,
            detail="Missing signature"
        )

    # 4. Generate our own signature
    expected_signature = "sha256=" + hmac.new(
        WEBHOOK_SECRET.encode("utf-8"),
        body,
        hashlib.sha256
    ).hexdigest()

    # 5. Compare both signatures
    if not hmac.compare_digest(
        expected_signature,
        signature
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid signature"
        )

    # 6. Identify the GitHub event
    event = request.headers.get("X-GitHub-Event")

    payload = json.loads(body)

    # 7. Handle Pull Request events
    if event == "pull_request":

        action = payload.get("action")

        if action == "opened":
            repository = payload.get(
                "repository", {}
            ).get("full_name")

            pr_number = payload.get(
                "number"
            )

            print("New Pull Request detected!")
            print("Repository:", repository)
            print("PR Number:", pr_number)

            return {
                "message": "Pull Request received!",
                "repository": repository,
                "pr_number": pr_number
            }

    return {
        "message": "Webhook received",
        "event": event
    }
