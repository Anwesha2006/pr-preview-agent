import pytest
from types import SimpleNamespace
from app import ai_reviewer


def test_review_code_rejects_missing_api_key(monkeypatch):
    monkeypatch.setattr(ai_reviewer, "GEMINI_API_KEY", None)

    with pytest.raises(ValueError, match="GEMINI_API_KEY"):
        ai_reviewer.review_code("test.py", "print('hello')")


def test_review_code_rejects_empty_code(monkeypatch):
    monkeypatch.setattr(ai_reviewer, "GEMINI_API_KEY", "test-key")

    with pytest.raises(ValueError, match="Code cannot be empty"):
        ai_reviewer.review_code("test.py", "   ")


def test_review_code_returns_gemini_response(monkeypatch):
    expected = "Potential division by zero."

    class FakeModels:
        def generate_content(self, **kwargs):
            return SimpleNamespace(text=expected)

    class FakeClient:
        def __init__(self, **kwargs):
            self.models = FakeModels()

    monkeypatch.setattr(ai_reviewer, "GEMINI_API_KEY", "test-key")
    monkeypatch.setattr(ai_reviewer.genai, "Client", FakeClient)

    result = ai_reviewer.review_code(
        "calculator.py",
        "def divide(a, b): return a / b"
    )

    assert result == expected


def test_review_code_handles_empty_gemini_response(monkeypatch):
    class FakeModels:
        def generate_content(self, **kwargs):
            return SimpleNamespace(text=None)

    class FakeClient:
        def __init__(self, **kwargs):
            self.models = FakeModels()

    monkeypatch.setattr(ai_reviewer, "GEMINI_API_KEY", "test-key")
    monkeypatch.setattr(ai_reviewer.genai, "Client", FakeClient)

    with pytest.raises(RuntimeError, match="empty response"):
        ai_reviewer.review_code("test.py", "print('hello')")


def test_review_code_truncates_long_code(monkeypatch):
    captured = {}

    class FakeModels:
        def generate_content(self, **kwargs):
            captured["prompt"] = kwargs["contents"]
            return SimpleNamespace(text="Review completed")

    class FakeClient:
        def __init__(self, **kwargs):
            self.models = FakeModels()

    monkeypatch.setattr(ai_reviewer, "GEMINI_API_KEY", "test-key")
    monkeypatch.setattr(ai_reviewer.genai, "Client", FakeClient)

    result = ai_reviewer.review_code("large.py", "a" * 21000)

    assert result == "Review completed"
    assert "Code truncated" in captured["prompt"]
    assert len(captured["prompt"]) < 21000 + 1000
