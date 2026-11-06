
from app.github_client import read_repository_files


MAX_TOOL_CALLS = 6
MAX_FILE_CHARS = 20000


def build_pr_tools(owner, repo, pr_number, head_sha, changed_files):

    allowed_files = {
        file["filename"]
        for file in changed_files
        if file["status"] != "removed"
    }

    tool_state = {"calls": 0}

    def check_tool_limit():
        if tool_state["calls"] >= MAX_TOOL_CALLS:
            raise RuntimeError("Maximum tool calls exceeded")

        tool_state["calls"] += 1

    def list_changed_files() -> dict:
        """Lists files changed in the current Pull Request."""

        check_tool_limit()

        results = []

        for file in changed_files:
            results.append({
                "filename": file["filename"],
                "status": file["status"],
                "additions": file["additions"],
                "deletions": file["deletions"]
            })

        print("[TOOL] Listing changed files")

        return {
            "total_files": len(results),
            "files": results
        }

    def read_changed_file(filename: str) -> dict:
        """Reads an exact file path from the current Pull Request."""

        check_tool_limit()

        print(f"[TOOL] Received filename: {repr(filename)}")
        print(f"[TOOL] Type: {type(filename).__name__}")

        if filename not in allowed_files:
            return {
                "error": f"'{filename}' is not part of this Pull Request.",
                "allowed_files": sorted(allowed_files)
            }

        content = read_repository_files(
            owner,
            repo,
            filename,
            head_sha
        )

        if len(content) > MAX_FILE_CHARS:
            content = (
                content[:MAX_FILE_CHARS]
                + "\n[File truncated due to size limit]"
            )

        return {
            "filename": filename,
            "content": content
        }

    return [
        list_changed_files,
        read_changed_file
    ]
