import hashlib
import hmac
import json
import pytest
from fastapi.testclient import TestClient

from app.api import webhooks
from app.main import app


client = TestClient(app)
SECRET = "unit-test-secret"


def post_webhook(monkeypatch, payload, event="pull_request", signature_secret=SECRET):
    monkeypatch.setattr(webhooks, "WEBHOOK_SECRET", SECRET)
    body = json.dumps(payload).encode("utf-8")
    signature = "sha256=" + hmac.new(
        signature_secret.encode(), body, hashlib.sha256
    ).hexdigest()
    return client.post(
        "/webhooks/github",
        content=body,
        headers={"X-GitHub-Event": event, "X-Hub-Signature-256": signature},
    )


@pytest.mark.parametrize("action", ["opened", "synchronize"])
def test_relevant_pull_request_actions_queue_task(monkeypatch, action):
    queued = []

    class Task:
        id = "task-123"

    monkeypatch.setattr(
        webhooks.review_pr_task,
        "delay",
        lambda *args: (queued.append(args) or Task()),
    )
    response = post_webhook(monkeypatch, {
        "action": action,
        "number": 42,
        "repository": {"full_name": "owner/project"},
    })
    assert response.status_code == 200
    assert queued == [("owner", "project", 42)]
    assert response.json()["task_id"] == "task-123"


def test_invalid_webhook_signature_is_rejected(monkeypatch):
    response = post_webhook(monkeypatch, {"action": "opened"}, signature_secret="wrong")
    assert response.status_code == 401


def test_irrelevant_event_is_ignored(monkeypatch):
    monkeypatch.setattr(webhooks.review_pr_task, "delay", lambda *args: pytest.fail("queued"))
    response = post_webhook(monkeypatch, {"action": "opened"}, event="issues")
    assert response.status_code == 200
    assert response.json()["event"] == "issues"


def test_irrelevant_pull_request_action_is_ignored(monkeypatch):
    monkeypatch.setattr(webhooks.review_pr_task, "delay", lambda *args: pytest.fail("queued"))
    response = post_webhook(monkeypatch, {"action": "closed"})
    assert response.status_code == 200


def test_celery_task_calls_existing_agent(monkeypatch):
    from app import tasks

    expected = {"summary": "done", "comments_posted": 0}
    called = []
    monkeypatch.setattr(tasks, "review_pull_request", lambda *args: (called.append(args) or expected))
    assert tasks.review_pr_task.run("owner", "repo", 7) == expected
    assert called == [("owner", "repo", 7)]


def test_duplicate_commit_review_is_skipped(monkeypatch):
    from app import ai_agent

    monkeypatch.setattr(ai_agent, "GEMINI_API_KEY", "test-key")
    monkeypatch.setattr(ai_agent, "get_pull_request", lambda *args: {"head": {"sha": "same-sha"}})
    monkeypatch.setattr(ai_agent, "has_already_reviewed", lambda *args: True)
    monkeypatch.setattr(ai_agent, "get_pull_request_files", lambda *args: pytest.fail("files fetched"))
    result = ai_agent.review_pull_request("owner", "repo", 7)
    assert result == {"message": "Duplicate review skipped.", "commit_sha": "same-sha"}


def test_new_commit_is_not_skipped(monkeypatch):
    from app import ai_agent

    calls = []
    monkeypatch.setattr(ai_agent, "GEMINI_API_KEY", "test-key")
    monkeypatch.setattr(ai_agent, "get_pull_request", lambda *args: {"head": {"sha": "new-sha"}, "title": "change"})
    monkeypatch.setattr(ai_agent, "has_already_reviewed", lambda *args: False)
    monkeypatch.setattr(ai_agent, "get_pull_request_files", lambda *args: (calls.append(args) or []))
    result = ai_agent.review_pull_request("owner", "repo", 7)
    assert calls == [("owner", "repo", 7)]
    assert result == {"message": "No files changed in this Pull Request."}

def test_webhook_rejects_json_array(monkeypatch):
    monkeypatch.setattr(webhooks, "WEBHOOK_SECRET", SECRET)

    body = json.dumps(["hello", "world"]).encode("utf-8")

    signature = "sha256=" + hmac.new(
        SECRET.encode(),
        body,
        hashlib.sha256
    ).hexdigest()

    response = client.post(
        "/webhooks/github",
        content=body,
        headers={
            "X-GitHub-Event": "pull_request",
            "X-Hub-Signature-256": signature
        }
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Webhook payload must be a JSON object"
def test_webhook_rejects_oversized_payload(monkeypatch):
    monkeypatch.setattr(webhooks, "WEBHOOK_SECRET", SECRET)

    body = b"x" * (1024 * 1024 + 1)

    response = client.post(
        "/webhooks/github",
        content=body,
        headers={
            "X-Hub-Signature-256": "sha256=invalid"
        }
    )

    assert response.status_code == 413
    assert response.json()["detail"] == "Webhook payload too large"

def test_first_delivery_is_not_duplicate(monkeypatch):
    monkeypatch.setattr(
        webhooks.redis_client,
        "set",
        lambda *args, **kwargs: True
    )

    assert webhooks.is_duplicate_delivery("new-delivery") is False


def test_repeated_delivery_is_duplicate(monkeypatch):
    monkeypatch.setattr(
        webhooks.redis_client,
        "set",
        lambda *args, **kwargs: False
    )

    assert webhooks.is_duplicate_delivery("duplicate-delivery") is True