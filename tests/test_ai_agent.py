
from app.ai_agent import review_pull_request


OWNER = "Anwesha2006"
REPO = "pr-review-agent-demo"
PR_NUMBER = 1


print("Starting PR Review Agent...")

try:

    result = review_pull_request(
        OWNER,
        REPO,
        PR_NUMBER
    )

    print("\n========== AI AGENT REVIEW ==========")
    print(result)

    print("\nAgent completed successfully!")

except Exception as error:

    print("\nAgent failed!")
    print(type(error).__name__, str(error))
