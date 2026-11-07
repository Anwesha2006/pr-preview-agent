from unittest.mock import patch
import pytest

from app.tasks import review_pr_task


def test_celery_task_retries_after_failure():
    with patch(
        "app.tasks.review_pull_request",
        side_effect=RuntimeError("Temporary Gemini error")
    ):
        with pytest.raises(Exception):
            review_pr_task.apply(
                args=("owner", "repo", 1),
                throw=True
            )
