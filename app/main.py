from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.dashboard import router as dashboard_router
from app.api.webhooks import router as webhook_router
from app.logging_config import setup_logging



from fastapi import Header, HTTPException
setup_logging()

app = FastAPI(
    title="PR Review Agent",
    description="An AI-powered GitHub Pull Request Reviewer",
    version="1.0.0"
)
app.include_router(dashboard_router)
# Allow the local Next.js frontend to communicate with FastAPI.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://pr-preview-agent.vercel.app",
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


