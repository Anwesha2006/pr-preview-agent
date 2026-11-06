from app.tasks import review_pr_task

OWNER = "Anwesha2006"
REPO = "pr-review-agent-demo"
PR_NUMBER = 2  # Use your actual PR number

print("Sending PR review task to Redis...")

task = review_pr_task.delay(
    OWNER,
    REPO,
    PR_NUMBER
)

print("Task submitted successfully!")
print("Task ID:", task.id)