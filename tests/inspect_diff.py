from app.github_client import get_pull_request_diff

OWNER = "Anwesha2006"
REPO = "pr-review-agent-demo"
PR_NUMBER = 1

diff = get_pull_request_diff(
    OWNER,
    REPO,
    PR_NUMBER
)

print("\n========== PULL REQUEST DIFF ==========\n")
print(diff)