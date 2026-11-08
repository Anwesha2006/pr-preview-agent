from fastapi import FastAPI
from app.api.webhooks import router as webhook_router
from app.logging_config import setup_logging

export type HealthStatus = "connected" | "offline" | "checking";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

export async function getHealth(): Promise<{ status: string; service?: string }> {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const response = await fetch(`${API_URL}/health`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    throw new Error(`Backend returned ${response.status}`);
  }

  return response.json() as Promise<{ status: string; service?: string }>;
}

export const apiConfiguration = {
  baseUrl: API_URL,
  configured: Boolean(API_URL),
};

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
