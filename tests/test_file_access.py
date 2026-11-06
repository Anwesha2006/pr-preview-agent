
from app.github_client import (
    get_pull_request,
    get_pull_request_files,
    read_repository_files
)

OWNER = "Anwesha2006"
REPO = "pr-review-agent-demo"
PR_NUMBER = 1

try:

    print("Fetching PR...")

    pr = get_pull_request(
        OWNER, REPO, PR_NUMBER
    )

    print("PR fetched successfully!")

    files = get_pull_request_files(
        OWNER, REPO, PR_NUMBER
    )

    print("\nChanged files:")

    for file in files:
        print(file["filename"], file["status"])

    print("\nFetching hello.py...")

    content = read_repository_files(
        OWNER,
        REPO,
        "hello.py",
        pr["head"]["sha"]
    )

    print("\nFile content:")
    print(content)

    print("\nGitHub file access successful!")

except Exception as error:

    print("\nFILE ACCESS FAILED")
    print(type(error).__name__, str(error))
