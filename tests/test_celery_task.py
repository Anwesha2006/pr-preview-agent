from unittest.mock import patch

from app.tasks import review_pr_task


def test_celery_task_returns_agent_result():
    expected = {
        "summary": "Review completed",
        "comments_posted": 1
    }

    with patch(
        "app.tasks.review_pull_request",
        return_value=expected
    ) as mock_review:

        result = review_pr_task.run("owner", "repo", 1)

    assert result == expected
    mock_review.assert_called_once_with("owner", "repo", 1)
