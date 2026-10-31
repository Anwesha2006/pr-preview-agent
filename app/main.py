from fastapi import FastAPI
app=FastAPI(
    title="PR Review Agent",
    description="An AI-powered GitHub Pull Request Reviewer",
    version="1.0.0"
)
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