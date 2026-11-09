from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.webhooks import router as webhook_router
from app.logging_config import setup_logging
from app.database.connection import Base, engine
from app.database import models
import os
import secrets

from fastapi import Header, HTTPException
setup_logging()

app = FastAPI(
    title="PR Review Agent",
    description="An AI-powered GitHub Pull Request Reviewer",
    version="1.0.0"
)

# Allow the local Next.js frontend to communicate with FastAPI.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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


@app.post("/admin/init-database")
def initialize_database(
    token: str = Header(..., alias="X-Init-Token")
):
    expected_token = os.getenv("DB_INIT_TOKEN")

    if not expected_token or not secrets.compare_digest(
        token, expected_token
    ):
        raise HTTPException(
            status_code=403,
            detail="Invalid initialization token"
        )

    Base.metadata.create_all(bind=engine)

    return {
        "status": "success",
        "message": "Database tables created successfully"
    }
