
import hashlib
import hmac
import json
import os
import urllib.request
import urllib.error
from dotenv import load_dotenv

load_dotenv()

secret = os.getenv("WEBHOOK_SECRET")

if not secret:
    raise ValueError("WEBHOOK_SECRET is missing")

# Simulated GitHub Pull Request event
payload = {
    "action": "opened",
    "number": 1,
    "repository": {
        "full_name": "demo-user/demo-repository"
    }
}

body = json.dumps(payload).encode("utf-8")

# Generate a valid GitHub-style signature
signature = "sha256=" + hmac.new(
    secret.encode("utf-8"),
    body,
    hashlib.sha256
).hexdigest()

request = urllib.request.Request(
    "http://127.0.0.1:8000/webhooks/github",
    data=body,
    headers={
        "Content-Type": "application/json",
        "X-GitHub-Event": "pull_request",
        "X-Hub-Signature-256": signature
    },
    method="POST"
)

try:
    with urllib.request.urlopen(request) as response:
        print("Status:", response.status)
        print(response.read().decode())

except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code)
    print("Reason:", e.reason)
    print("Server Response:", e.read().decode())

except urllib.error.URLError as e:
    print("Connection Error:", e.reason)