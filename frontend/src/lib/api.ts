
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

export interface DashboardStats {
  total_reviews: number;
  total_findings: number;
  high_severity: number;
  medium_severity: number;
  low_severity: number;
}

export interface RecentReview {
  id: number;
  repository: string;
  pr_number: number;
  pr_title: string | null;
  pr_url: string | null;
  findings_count: number;
  comments_posted: number;
  status: string;
  created_at: string;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const response = await fetch(`${API_URL}/api/dashboard/stats`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Dashboard API returned ${response.status}`);
  }

  return response.json();
}

export async function getRecentReviews(): Promise<RecentReview[]> {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const response = await fetch(
    `${API_URL}/api/dashboard/recent-reviews`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error(`Recent reviews API returned ${response.status}`);
  }

  return response.json();
}
