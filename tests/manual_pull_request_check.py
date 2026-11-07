
from app.github_client import (
    get_pull_request,
    get_pull_request_files,
    get_pull_request_diff,
    read_repository_files
)

OWNER = "Anwesha2006"
REPO = "pr-review-agent-demo"
PR_NUMBER = 1


# 1. Fetch PR details
pr = get_pull_request(OWNER, REPO, PR_NUMBER)

print("\n========== PR DETAILS ==========")

print("Title:", pr["title"])
print("Author:", pr["user"]["login"])
print("State:", pr["state"])


# 2. Fetch changed files
files = get_pull_request_files(
    OWNER,
    REPO,
    PR_NUMBER
)

print("\n========== CHANGED FILES ==========")

for file in files:

    print("\nFilename:", file["filename"])
    print("Status:", file["status"])
    print("Additions:", file["additions"])
    print("Deletions:", file["deletions"])

    print("\nCode changes:")
    print(file.get("patch", "Patch unavailable"))


# 3. Fetch complete diff
diff = get_pull_request_diff(
    OWNER,
    REPO,
    PR_NUMBER
)

print("\n========== COMPLETE DIFF ==========")
print(diff)

print("\n========== FILE CONTENTS ==========")

for file in files:

    if file["status"] == "removed":
        continue

    content = read_repository_files(
        OWNER,
        REPO,
        pr["head"]["sha"],
        file["filename"]
    )

    print("\nFile:", file["filename"])
    print(content)
