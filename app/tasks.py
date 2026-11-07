import logging
import json

from app.celery_app import celery_app
from app.ai_agent import review_pull_request

logger = logging.getLogger(__name__)


@celery_app.task(
    name="app.tasks.review_pr_task",
    bind=True,
    max_retries=3,
    default_retry_delay=10
)
def review_pr_task(self, owner, repo, pr_number):

    logger.info(
        "Celery task received: %s/%s PR #%s",
        owner, repo, pr_number
    )

    try:
        logger.info(
            "AI review started: %s/%s PR #%s",
            owner, repo, pr_number
        )

        result = review_pull_request(owner, repo, pr_number)

        if not isinstance(result, dict):
            result = {"result": result}

        # Ensure result is JSON serializable.
        result = json.loads(json.dumps(result))

        logger.info(
            "AI review completed: %s/%s PR #%s",
            owner, repo, pr_number
        )

        return result

    except Exception as exc:

        logger.exception(
            "AI review failed: %s/%s PR #%s",
            owner, repo, pr_number
        )

        # Retry up to 3 times with exponential backoff.
        raise self.retry(
            exc=exc,
            countdown=10 * (2 ** self.request.retries)
        )
