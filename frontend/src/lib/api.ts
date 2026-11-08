
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
