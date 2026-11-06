import time
import httpx
import jwt
import base64
from urllib.parse import quote
from pathlib import Path
from app.config import GITHUB_APP_ID, GITHUB_INSTALLATION_ID, GITHUB_PRIVATE_KEY_PATH

GITHUB_API = "https://api.github.com"
def generate_app_jwt():
    if not all([GITHUB_APP_ID,GITHUB_INSTALLATION_ID]):
        raise ValueError("GitHub App credentials are missing")
    private_key_path=Path(GITHUB_PRIVATE_KEY_PATH)
    if not private_key_path.is_absolute():
        private_key_path=Path.cwd() / private_key_path
    private_key=private_key_path.read_text()
    now=int(time.time())
    payload={
        "iat": now - 60,
        "exp": now + 60 * 10,
        "iss": GITHUB_APP_ID
    }
    token=jwt.encode(
        payload,
        private_key,
        algorithm="RS256"
    )
    return token
def get_installation_token():
    if not GITHUB_INSTALLATION_ID:
        raise ValueError("GitHub Installation ID is missing")
    app_jwt=generate_app_jwt()
    url=(
        f"{GITHUB_API}/app/installations/"
        f"{GITHUB_INSTALLATION_ID}/access_tokens"
    )
    headers={
        "Authorization": f"Bearer {app_jwt}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
    }
    response=httpx.post(
        url,
        headers=headers,
        json={},
        timeout=10
    )
    response.raise_for_status()
    data=response.json()
    return data["token"]
def get_pull_request(owner,repo,pr_number):
    token=get_installation_token()
    url=(
        f"{GITHUB_API}/repos/{owner}/{repo}/pulls/{pr_number}"
    )
    headers={
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
    }
    response=httpx.get(
        url,
        headers=headers,
        timeout=20
    )
    response.raise_for_status()
    return response.json()
def get_pull_request_diff(owner, repo, pr_number):
    token = get_installation_token()
    url = (
        f"{GITHUB_API}/repos/{owner}/{repo}/pulls/{pr_number}"
    )
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github.diff",
        "X-GitHub-Api-Version": "2022-11-28"
    }
    response = httpx.get(
        url,
        headers=headers,
        timeout=20.0
    )
    response.raise_for_status()
    return response.text

def get_pull_request_files(owner, repo, pr_number):
    token = get_installation_token()
    url = (
        f"{GITHUB_API}/repos/{owner}/{repo}"
        f"/pulls/{pr_number}/files"
    )
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
    }
    all_files=[]
    page=1
    while True:
        response=httpx.get(
            url,
            headers=headers,
            params={"page": page, "per_page": 100},
            timeout=20.0
        )
        response.raise_for_status()
        files=response.json()
        if not files:
            break
        all_files.extend(files)
        if len(files) < 100:
            break
        page += 1
    return all_files




def read_repository_files(owner, repo, file_path, ref):
    token = get_installation_token()

    encoded_path = quote(file_path, safe="/")

    url = (
        f"{GITHUB_API}/repos/{owner}/{repo}"
        f"/contents/{encoded_path}"
    )

    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
    }

    print(f"[GITHUB] Reading file: {file_path}")
    print(f"[GITHUB] Commit: {ref}")

    response = httpx.get(
        url,
        headers=headers,
        params={"ref": ref},
        timeout=20.0
    )

    if response.is_error:
        raise RuntimeError(
            f"GitHub API returned HTTP {response.status_code}: "
            f"{response.text[:500]}"
        )

    data = response.json()

    if data.get("encoding") != "base64":
        raise ValueError(
            f"Unexpected file encoding: {data.get('encoding')}"
        )

    content = base64.b64decode(data["content"])

    return content.decode("utf-8", errors="replace")

def post_pull_request_review(
    owner,
    repo,
    pr_number,
    body,
    comments=None
):
    token = get_installation_token()

    url = (
        f"{GITHUB_API}/repos/{owner}/{repo}"
        f"/pulls/{pr_number}/reviews"
    )

    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
    }

    payload = {
        "body": body,
        "event": "COMMENT"
    }

    if comments:
        payload["comments"] = comments

    response = httpx.post(
        url,
        headers=headers,
        json=payload,
        timeout=30.0
    )

    if response.is_error:
        raise RuntimeError(
            f"GitHub review failed: "
            f"{response.status_code} - {response.text}"
        )

    return response.json()