"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bug,
  Calendar,
  ChevronRight,
  GitBranch,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { getDashboardAnalytics, type DashboardAnalytics } from "@/lib/api";
import { PageHeader, EmptyState } from "@/components/ui-components";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from "recharts";

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await getDashboardAnalytics();
        if (alive) setAnalytics(data);
      } catch (err) {
        if (alive) {
          setError(
            err instanceof Error ? err.message : "Failed to load review analytics"
          );
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const severity = analytics?.severity_breakdown ?? {};
  const highCount = severity.high ?? 0;
  const mediumCount = severity.medium ?? 0;
  const lowCount = severity.low ?? 0;
  const totalFindings = highCount + mediumCount + lowCount;

  const dailyData = analytics?.daily_reviews?.map((item) => ({
    date: item.date.slice(5), // "MM-DD"
    fullDate: item.date,
    count: item.count,
  })) ?? [];

  const totalReviewsInPeriod = dailyData.reduce((acc, curr) => acc + curr.count, 0);

  const severityChartData = [
    { name: "High Severity", count: highCount, color: "#EF4444" },
    { name: "Medium Severity", count: mediumCount, color: "#F59E0B" },
    { name: "Low Severity", count: lowCount, color: "#38BDF8" },
  ];

  const topRepos = analytics?.top_repositories ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Intelligence & Metrics"
        title="Review Analytics"
        description="Comprehensive insights into pull request volume, defect patterns, and repository health."
        actions={
          <div className="topbar-env-pill">
            <Calendar size={13} style={{ color: "var(--accent-saffron)" }} />
            <span>Last 30 Days Window</span>
          </div>
        }
      />

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

      {/* Analytics KPI Stat Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-head">
            <span className="kpi-label">30-Day PR Volume</span>
            <div className="kpi-icon-wrap saffron">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="kpi-value">{loading ? "—" : totalReviewsInPeriod}</div>
          <div className="kpi-subtext">
            <span className="dot" />
            <span>Pull requests reviewed</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-head">
            <span className="kpi-label">Total Findings</span>
            <div className="kpi-icon-wrap saffron">
              <Bug size={16} />
            </div>
          </div>
          <div className="kpi-value">{loading ? "—" : totalFindings}</div>
          <div className="kpi-subtext">
            <span className="dot" />
            <span>Defects identified across all repos</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-head">
            <span className="kpi-label">High Severity Ratio</span>
            <div className="kpi-icon-wrap red">
              <ShieldAlert size={16} />
            </div>
          </div>
          <div className="kpi-value">
            {loading
              ? "—"
              : totalFindings > 0
              ? `${Math.round((highCount / totalFindings) * 100)}%`
              : "0%"}
          </div>
          <div className="kpi-subtext">
            <span className="dot" />
            <span>{highCount} high-severity findings</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-head">
            <span className="kpi-label">Active Repositories</span>
            <div className="kpi-icon-wrap green">
              <GitBranch size={16} />
            </div>
          </div>
          <div className="kpi-value">{loading ? "—" : topRepos.length}</div>
          <div className="kpi-subtext">
            <span className="dot" />
            <span>Repositories under review</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))", gap: 20, marginBottom: 20 }}>
        {/* Daily PR Review Activity Area Chart */}
        <section className="card">
          <div className="card-header">
            <div className="card-title-group">
              <h2 className="card-title">Daily Review Activity</h2>
              <p className="card-subtitle">
                Automated pull request inspections per day (30-day window)
              </p>
            </div>
            <span className="status-badge completed" style={{ fontSize: 10 }}>
              Live Synced
            </span>
          </div>

          <div style={{ padding: "24px 20px 14px", minHeight: 280 }}>
            {loading ? (
              <div style={{ height: 230, display: "grid", placeItems: "center", color: "var(--text-muted)" }}>
                Loading activity data...
              </div>
            ) : dailyData.length === 0 ? (
              <EmptyState
                icon={Activity}
                title="No review activity in this period"
                description="Activity trends will appear as webhook events are received from GitHub."
              />
            ) : (
              <div style={{ width: "100%", height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="analyticsSaffron" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F5840C" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#F5840C" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="date"
                      stroke="#666E7C"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                    />
                    <YAxis
                      stroke="#666E7C"
                      fontSize={11}
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111318",
                        borderColor: "rgba(255,255,255,0.12)",
                        borderRadius: 6,
                        fontSize: 12,
                        color: "#F2EFE8",
                      }}
                      formatter={(val) => [`${val} reviews`, "Review Volume"]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#F5840C"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#analyticsSaffron)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </section>

        {/* Severity Distribution Bar Chart */}
        <section className="card">
          <div className="card-header">
            <div className="card-title-group">
              <h2 className="card-title">Findings by Severity</h2>
              <p className="card-subtitle">
                Distribution of code quality defects across severity levels
              </p>
            </div>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
              {totalFindings} Total Findings
            </span>
          </div>

          <div style={{ padding: "24px 20px 14px", minHeight: 280 }}>
            {loading ? (
              <div style={{ height: 230, display: "grid", placeItems: "center", color: "var(--text-muted)" }}>
                Loading severity data...
              </div>
            ) : totalFindings === 0 ? (
              <EmptyState
                icon={ShieldCheck}
                title="Zero defects recorded"
                description="No findings have been flagged across your reviews."
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ width: "100%", height: 160 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={severityChartData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis type="number" stroke="#666E7C" fontSize={11} allowDecimals={false} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        stroke="#9299A6"
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                        width={110}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#111318",
                          borderColor: "rgba(255,255,255,0.12)",
                          borderRadius: 6,
                          fontSize: 12,
                          color: "#F2EFE8",
                        }}
                      />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {severityChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Progress bars & percentages */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  {severityChartData.map((item) => (
                    <div
                      key={item.name}
                      style={{
                        padding: "10px 12px",
                        background: "var(--panel-secondary)",
                        border: "1px solid var(--line)",
                        borderRadius: "var(--radius-md)",
                      }}
                    >
                      <span style={{ fontSize: 10.5, color: "var(--text-muted)", display: "block" }}>
                        {item.name}
                      </span>
                      <strong style={{ fontSize: 16, color: item.color, marginTop: 4, display: "block" }}>
                        {item.count}{" "}
                        <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 400 }}>
                          ({totalFindings > 0 ? Math.round((item.count / totalFindings) * 100) : 0}%)
                        </span>
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Most Reviewed Repositories Section */}
      <section className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div className="card-title-group">
            <h2 className="card-title">Most Reviewed Repositories</h2>
            <p className="card-subtitle">
              Repositories receiving the highest automated review activity
            </p>
          </div>
          <Link href="/repositories" className="btn btn-ghost" style={{ fontSize: 11, padding: "0 8px" }}>
            View Repositories <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: 24 }}>
            {[1, 2].map((i) => (
              <div
                key={i}
                style={{
                  height: 50,
                  background: "rgba(255, 255, 255, 0.02)",
                  borderRadius: 8,
                  marginBottom: 10,
                }}
              />
            ))}
          </div>
        ) : topRepos.length === 0 ? (
          <EmptyState
            icon={GitBranch}
            title="No repository activity yet"
            description="Repositories will be cataloged automatically as pull request webhooks trigger reviews."
          />
        ) : (
          <div>
            {topRepos.map((repo, idx) => {
              const maxReviews = Math.max(1, ...topRepos.map((r) => r.review_count));
              const percentage = Math.round((repo.review_count / maxReviews) * 100);

              return (
                <div
                  key={repo.repository}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 22px",
                    borderBottom: idx === topRepos.length - 1 ? "none" : "1px solid var(--line-soft)",
                    gap: 20,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 220, flex: 1 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "var(--radius-md)",
                        background: "var(--panel-secondary)",
                        border: "1px solid var(--line)",
                        display: "grid",
                        placeItems: "center",
                        color: "var(--text-secondary)",
                      }}
                    >
                      <GitBranch size={16} />
                    </div>
                    <div>
                      <strong
                        style={{
                          display: "block",
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {repo.repository}
                      </strong>
                      <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                        Rank #{idx + 1} by review frequency
                      </span>
                    </div>
                  </div>

                  {/* Relative bar track */}
                  <div
                    style={{
                      flex: 1.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        height: 8,
                        background: "rgba(255, 255, 255, 0.06)",
                        borderRadius: 9999,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${percentage}%`,
                          background: "var(--accent-saffron)",
                          borderRadius: 9999,
                          transition: "width 0.4s ease",
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        minWidth: 70,
                        textAlign: "right",
                      }}
                    >
                      {repo.review_count} {repo.review_count === 1 ? "review" : "reviews"}
                    </span>
                  </div>

                  <Link
                    href={`/reviews?repo=${encodeURIComponent(repo.repository)}`}
                    className="btn btn-secondary"
                    style={{ height: 30, fontSize: 11, padding: "0 10px" }}
                  >
                    Reviews <ChevronRight size={13} />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer Info Strip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 16px",
          background: "var(--panel)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-md)",
          fontSize: 11.5,
          color: "var(--text-secondary)",
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--green-success)",
            boxShadow: "0 0 8px rgba(16, 185, 129, 0.6)",
          }}
        />
        <span>
          Live telemetry aggregated from real PostgreSQL database records. All statistics reflect actual automated runs.
        </span>
      </div>
    </>
  );
}
