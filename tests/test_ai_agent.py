import pytest
from app import ai_agent


def test_duplicate_review_is_skipped(monkeypatch):
    monkeypatch.setattr(ai_agent, "GEMINI_API_KEY", "test-key")
    monkeypatch.setattr(
        ai_agent,
        "get_pull_request",
        lambda *args: {"head": {"sha": "abc123"}}
    )
    monkeypatch.setattr(
        ai_agent,
        "has_already_reviewed",
        lambda *args: True
    )
    monkeypatch.setattr(
        ai_agent,
        "get_pull_request_files",
        lambda *args: pytest.fail("Files should not be fetched")
    )

    result = ai_agent.review_pull_request("owner", "repo", 1)

    assert result == {
        "message": "Duplicate review skipped.",
        "commit_sha": "abc123"
    }


def test_no_changed_files(monkeypatch):
    monkeypatch.setattr(ai_agent, "GEMINI_API_KEY", "test-key")
    monkeypatch.setattr(
        ai_agent,
        "get_pull_request",
        lambda *args: {"head": {"sha": "abc123"}, "title": "Test"}
    )
    monkeypatch.setattr(ai_agent, "has_already_reviewed", lambda *args: False)
    monkeypatch.setattr(ai_agent, "get_pull_request_files", lambda *args: [])

    result = ai_agent.review_pull_request("owner", "repo", 1)

    assert result == {
        "message": "No files changed in this Pull Request."
    }


def test_missing_api_key(monkeypatch):
    monkeypatch.setattr(ai_agent, "GEMINI_API_KEY", None)

    with pytest.raises(ValueError, match="GEMINI_API_KEY"):
        ai_agent.review_pull_request("owner", "repo", 1)


def test_added_lines_detection():
    changed_files = [
        {
            "filename": "hello.py",
            "patch": """@@ -1,2 +1,4 @@
 old_line
+new_line_1
+new_line_2
 another_line"""
        }
    ]

    result = ai_agent.get_added_lines(changed_files)

    assert result["hello.py"] == {2, 3}


def test_invalid_finding_location_is_not_posted(monkeypatch):
    monkeypatch.setattr(ai_agent, "GEMINI_API_KEY", "test-key")

    monkeypatch.setattr(
        ai_agent,
        "get_pull_request",
        lambda *args: {
            "head": {"sha": "abc123"},
            "title": "Test",
            "body": ""
        }
    )
    monkeypatch.setattr(ai_agent, "has_already_reviewed", lambda *args: False)

    changed_files = [
        {
            "filename": "hello.py",
            "patch": """@@ -1,1 +1,2 @@
 old_line
+new_line"""
        }
    ]

    monkeypatch.setattr(
        ai_agent,
        "get_pull_request_files",
        lambda *args: changed_files
    )

    monkeypatch.setattr(ai_agent, "build_pr_tools", lambda *args: [])

    class FakeChat:
        def send_message(self, prompt):
            class Response:
                text = (
                    '{"summary":"Review complete","findings":['
                    '{"file":"hello.py","line":99,'
                    '"severity":"high","issue":"Fake issue",'
                    '"suggestion":"Fix it"}]}'
                )
            return Response()

    class FakeChats:
        def create(self, **kwargs):
            return FakeChat()

    class FakeClient:
        def __init__(self, **kwargs):
            self.chats = FakeChats()

    monkeypatch.setattr(ai_agent.genai, "Client", FakeClient)

    posted = {}

    def fake_post(owner, repo, number, body, comments):
        posted["comments"] = comments
        return {"id": 123}

    monkeypatch.setattr(ai_agent, "post_pull_request_review", fake_post)

    result = ai_agent.review_pull_request("owner", "repo", 1)

    assert posted["comments"] == []
    assert result["comments_posted"] == 0


def test_valid_finding_is_posted(monkeypatch):
    monkeypatch.setattr(ai_agent, "GEMINI_API_KEY", "test-key")

    monkeypatch.setattr(
        ai_agent,
        "get_pull_request",
        lambda *args: {
            "head": {"sha": "abc123"},
            "title": "Test",
            "body": ""
        }
    )
    monkeypatch.setattr(ai_agent, "has_already_reviewed", lambda *args: False)

    changed_files = [
        {
            "filename": "hello.py",
            "patch": """@@ -1,1 +1,2 @@
 old_line
+new_line"""
        }
    ]

    monkeypatch.setattr(
        ai_agent,
        "get_pull_request_files",
        lambda *args: changed_files
    )
    monkeypatch.setattr(ai_agent, "build_pr_tools", lambda *args: [])

    class FakeChat:
        def send_message(self, prompt):
            class Response:
                text = (
                    '{"summary":"Bug found","findings":['
                    '{"file":"hello.py","line":2,'
                    '"severity":"high","issue":"Bug found",'
                    '"suggestion":"Fix the bug"}]}'
                )
            return Response()

    class FakeChats:
        def create(self, **kwargs):
            return FakeChat()

    class FakeClient:
        def __init__(self, **kwargs):
            self.chats = FakeChats()

    monkeypatch.setattr(ai_agent.genai, "Client", FakeClient)

    posted = {}

    def fake_post(owner, repo, number, body, comments):
        posted["body"] = body
        posted["comments"] = comments
        return {"id": 456}

    monkeypatch.setattr(ai_agent, "post_pull_request_review", fake_post)

    result = ai_agent.review_pull_request("owner", "repo", 1)

    assert len(posted["comments"]) == 1
    assert posted["comments"][0]["path"] == "hello.py"
    assert posted["comments"][0]["line"] == 2
    assert result["comments_posted"] == 1
    assert result["github_review_id"] == 456
