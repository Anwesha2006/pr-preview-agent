"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bug,
  ChevronRight,
  GitBranch,
  GitPullRequest,
  ShieldAlert,
  Sparkles,
  Workflow,
  Zap,
} from "lucide-react";
import {
  getDashboardStats,
  getRecentReviews,
  getDashboardAnalytics,
  type DashboardStats,
  type RecentReview,
  type DashboardAnalytics,
} from "@/lib/api";
import { PageHeader, EmptyState, StatusBadge } from "@/components/ui-components";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export function OverviewDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [reviews, setReviews] = useState<RecentReview[]>([]);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [statsData, reviewsData, analyticsData] = await Promise.allSettled([
          getDashboardStats(),
          getRecentReviews(),
          getDashboardAnalytics(),
        ]);

        if (!alive) return;

        if (statsData.status === "fulfilled") {
          setStats(statsData.value);
        } else {
          console.error("Stats error:", statsData.reason);
        }

        if (reviewsData.status === "fulfilled") {
          setReviews(reviewsData.value);
        } else {
          console.error("Reviews error:", reviewsData.reason);
        }

        if (analyticsData.status === "fulfilled") {
          setAnalytics(analyticsData.value);
        } else {
          console.error("Analytics error:", analyticsData.reason);
        }

        if (statsData.status === "rejected" && reviewsData.status === "rejected") {
          setError("Failed to fetch dashboard data from backend.");
        }
      } catch (err) {
        if (alive) {
          setError(err instanceof Error ? err.message : "Unexpected error");
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadData();
    return () => {
      alive = false;
    };
  }, []);

  const totalReviews = stats?.total_reviews ?? reviews.length;
  const totalFindings = stats?.total_findings ?? 0;
  const highSeverity = stats?.high_severity ?? 0;
  const completedReviews = reviews.filter((r) => r.status === "completed").length;

  const kpis = [
    {
      label: "Total PRs Reviewed",
      value: totalReviews,
      subtext: "All time automated reviews",
      tone: "neutral",
      icon: GitPullRequest,
    },
    {
      label: "Bugs Detected",
      value: totalFindings,
      subtext: "Identified in source diffs",
      tone: "saffron",
      icon: Bug,
    },
    {
      label: "High Severity Findings",
      value: highSeverity,
      subtext: "Critical & security concerns",
      tone: "red",
      icon: ShieldAlert,
    },
    {
      label: "Successful Reviews",
      value: completedReviews,
      subtext: `${completedReviews} of ${reviews.length || 1} recent completed`,
      tone: "green",
      icon: Workflow,
    },
  ];

  const chartData = analytics?.daily_reviews?.map((d) => ({
    date: d.date.slice(5), // "MM-DD"
    reviews: d.count,
  })) ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Continuous AI Code Review"
        title="Overview"
        description="Monitor automated pull request inspections, defect trends, and reviewer performance."
        actions={
          <Link href="/reviews" className="btn btn-primary">
            <GitPullRequest size={14} />
            View All Reviews
            <ArrowRight size={13} />
          </Link>
        }
      />

      {/* AI Reviewer Status Technical Banner */}
      <div className="tech-banner">
        <div className="tech-banner-glow" />
        <div className="tech-banner-content">
          <div className="tech-banner-icon">
            <Sparkles size={20} />
          </div>
          <div className="tech-banner-text">
            <strong>AI Agent Engine Active</strong>
            <p>
              Autonomous code analysis running on GitHub webhook events.
              Every push and pull request is reviewed line-by-line for bugs, security vulnerabilities, and logic flaws.
            </p>
          </div>
        </div>

        <div className="tech-banner-meta">
          <div className="tech-meta-item">
            <span>LLM Model</span>
            <strong>{process.env.NEXT_PUBLIC_AI_MODEL || "Gemini 3.1 Flash Lite"}</strong>
          </div>
          <div className="tech-meta-item">
            <span>Provider</span>
            <strong>Google AI</strong>
          </div>
          <div className="tech-meta-item">
            <span>Status</span>
            <span className="status-badge completed" style={{ marginTop: 2 }}>
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "currentColor",
                }}
              />
              Listening
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: "12px 16px",
            background: "var(--red-muted)",
            border: "1px solid var(--red-border)",
            borderRadius: "var(--radius-md)",
            color: "#FCA5A5",
            fontSize: 12,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <ShieldAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="kpi-grid">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="kpi-card">
              <div className="kpi-head">
                <span className="kpi-label">{kpi.label}</span>
                <div className={`kpi-icon-wrap ${kpi.tone}`}>
                  <Icon size={16} />
                </div>
              </div>
              <div className="kpi-value">{loading ? "—" : kpi.value}</div>
              <div className="kpi-subtext">
                <span className="dot" />
                <span>{kpi.subtext}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Dashboard Layout */}
      <div className="dashboard-grid">
        {/* Left Column: Recent Activity */}
        <section className="card">
          <div className="card-header">
            <div className="card-title-group">
              <h2 className="card-title">Recent PR Reviews</h2>
              <p className="card-subtitle">
                Latest pull requests inspected by Patchwork
              </p>
            </div>
            <Link
              href="/reviews"
              className="btn btn-ghost"
              style={{ fontSize: 11, padding: "0 8px" }}
            >
              View History
              <ChevronRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: 24 }}>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    height: 56,
                    background: "rgba(255, 255, 255, 0.02)",
                    borderRadius: 8,
                    marginBottom: 10,
                  }}
                />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <EmptyState
              icon={GitPullRequest}
              title="No reviews recorded yet"
              description="When a pull request is opened or updated on your GitHub repository, the AI agent will analyze it and display findings here."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {reviews.map((review) => {
                const date = new Date(review.created_at);
                const formattedDate = date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <Link
                    key={review.id}
                    href={`/reviews/${review.id}`}
                    className="review-row"
                  >
                    <div className="review-row-main">
                      <div className="review-row-icon">
                        <GitPullRequest size={17} />
                      </div>
                      <div className="review-row-info">
                        <div className="review-row-title-line">
                          <span className="review-repo-badge">
                            {review.repository} #{review.pr_number}
                          </span>
                          <span className="review-pr-title">
                            {review.pr_title || "Pull request inspection"}
                          </span>
                        </div>
                        <div className="review-row-subline">
                          <span>{formattedDate}</span>
                          <span>·</span>
                          <span>{review.comments_posted} comments posted</span>
                        </div>
                      </div>
                    </div>

                    <div className="review-row-meta">
                      <span
                        className={`findings-indicator ${
                          review.findings_count > 0 ? "has-findings" : ""
                        }`}
                      >
                        <Bug size={13} />
                        {review.findings_count}{" "}
                        {review.findings_count === 1 ? "finding" : "findings"}
                      </span>
                      <StatusBadge status={review.status} />
                      <ChevronRight
                        size={15}
                        style={{ color: "var(--text-muted)" }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Right Column: Mini Chart & Quick Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Review Activity Mini Chart */}
          <section className="card">
            <div className="card-header">
              <div className="card-title-group">
                <h2 className="card-title">Review Volume</h2>
                <p className="card-subtitle">Daily reviews over last 30 days</p>
              </div>
              <Link
                href="/analytics"
                className="btn btn-ghost"
                style={{ fontSize: 11, padding: "0 8px" }}
              >
                Analytics <ArrowRight size={12} />
              </Link>
            </div>

            <div style={{ padding: "16px 12px 10px", minHeight: 180 }}>
              {chartData.length > 0 ? (
                <div style={{ width: "100%", height: 160 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="overviewSaffron"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#F5840C"
                            stopOpacity={0.35}
                          />
                          <stop
                            offset="95%"
                            stopColor="#F5840C"
                            stopOpacity={0.0}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="date"
                        stroke="#666E7C"
                        fontSize={10}
                        tickLine={false}
                        axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                      />
                      <YAxis
                        stroke="#666E7C"
                        fontSize={10}
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#111318",
                          borderColor: "rgba(255,255,255,0.12)",
                          borderRadius: 6,
                          fontSize: 11,
                          color: "#F2EFE8",
                        }}
                        itemStyle={{ color: "#F5840C" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="reviews"
                        stroke="#F5840C"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#overviewSaffron)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState
                  icon={Activity}
                  title="No 30-day activity"
                  description="Activity trends will appear here as PR reviews are processed."
                />
              )}
            </div>
          </section>

          {/* Quick Navigation Cards */}
          <section className="card">
            <div className="card-header">
              <div className="card-title-group">
                <h2 className="card-title">Quick Links</h2>
                <p className="card-subtitle">Jump to key workspace tools</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <Link
                href="/repositories"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "13px 18px",
                  borderBottom: "1px solid var(--line-soft)",
                  transition: "background 0.15s ease",
                }}
                className="quick-link-row"
              >
                <div className="review-row-icon" style={{ width: 30, height: 30 }}>
                  <GitBranch size={15} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong
                    style={{
                      display: "block",
                      fontSize: 12,
                      color: "var(--text-primary)",
                      fontWeight: 500,
                    }}
                  >
                    Connected Repositories
                  </strong>
                  <span style={{ fontSize: 10.5, color: "var(--text-secondary)" }}>
                    Inspect synced GitHub repositories & webhook status
                  </span>
                </div>
                <ChevronRight size={14} style={{ color: "var(--text-muted)" }} />
              </Link>

              <Link
                href="/analytics"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "13px 18px",
                  borderBottom: "1px solid var(--line-soft)",
                  transition: "background 0.15s ease",
                }}
                className="quick-link-row"
              >
                <div className="review-row-icon" style={{ width: 30, height: 30 }}>
                  <Activity size={15} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong
                    style={{
                      display: "block",
                      fontSize: 12,
                      color: "var(--text-primary)",
                      fontWeight: 500,
                    }}
                  >
                    Review Analytics
                  </strong>
                  <span style={{ fontSize: 10.5, color: "var(--text-secondary)" }}>
                    Deep dive into defect distributions and review velocity
                  </span>
                </div>
                <ChevronRight size={14} style={{ color: "var(--text-muted)" }} />
              </Link>

              <Link
                href="/settings"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "13px 18px",
                  transition: "background 0.15s ease",
                }}
                className="quick-link-row"
              >
                <div className="review-row-icon" style={{ width: 30, height: 30 }}>
                  <Zap size={15} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong
                    style={{
                      display: "block",
                      fontSize: 12,
                      color: "var(--text-primary)",
                      fontWeight: 500,
                    }}
                  >
                    Integration Settings
                  </strong>
                  <span style={{ fontSize: 10.5, color: "var(--text-secondary)" }}>
                    Configure webhooks, AI models, and backend health
                  </span>
                </div>
                <ChevronRight size={14} style={{ color: "var(--text-muted)" }} />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
