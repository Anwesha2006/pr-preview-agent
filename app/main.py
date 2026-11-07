from fastapi import FastAPI
from app.api.webhooks import router as webhook_router
from app.logging_config import setup_logging

setup_logging()

app = FastAPI(
    title="PR Review Agent",
    description="An AI-powered GitHub Pull Request Reviewer",
    version="1.0.0"
)

app.include_router(webhook_router)


@app.get("/")
def home():
    return {
        "message": "PR Review Agent is running!",
        "status": "success"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "PR Review Agent"
    }
