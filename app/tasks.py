from app.celery_app import celery_app
from app.ai_agent import review_pull_request


@celery_app.task(
    name="app.tasks.review_pr_task"
)
def review_pr_task(owner, repo, pr_number):

    print(
        f"Starting background review: "
        f"{owner}/{repo} PR #{pr_number}"
    )

    result = review_pull_request(
        owner,
        repo,
        pr_number
    )

    print("Background review completed!")

    return result