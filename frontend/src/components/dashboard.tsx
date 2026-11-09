"use client";

import { useEffect, useState } from "react";
import {getDashboardStats,getRecentReviews,type DashboardStats,type RecentReview,} from "@/lib/api";
import Link from "next/link";
import { Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Bug, Clock3, Code2, GitBranch, GitPullRequest, ShieldCheck, Sparkles, Workflow } from "lucide-react";

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-mark" />{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action && <div className="heading-action">{action}</div>}</div>;
}

function EmptyState({ icon: Icon, title, description, action }: { icon: React.ElementType; title: string; description: string; action?: React.ReactNode }) {
  return <div className="empty-state"><div className="empty-icon"><Icon size={21} strokeWidth={1.7} /></div><h3>{title}</h3><p>{description}</p>{action}</div>;
}

function SectionHeader({ title, caption, link }: { title: string; caption?: string; link?: React.ReactNode }) {
  return <div className="section-header"><div><h2>{title}</h2>{caption && <p>{caption}</p>}</div>{link}</div>;
}


export function OverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [reviews, setReviews] = useState<RecentReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        const [statsData, reviewsData] = await Promise.all([
          getDashboardStats(),
          getRecentReviews(),
        ]);

        setStats(statsData);
        setReviews(reviewsData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const statCards = [
    {
      title: "PRs reviewed",
      icon: GitPullRequest,
      value: stats?.total_reviews ?? 0,
      note: "Total reviews stored",
      tone: "neutral",
    },
    {
      title: "Bugs detected",
      icon: Bug,
      value: stats?.total_findings ?? 0,
      note: "Total findings detected",
      tone: "orange",
    },
    {
      title: "High severity",
      icon: ShieldCheck,
      value: stats?.high_severity ?? 0,
      note: "High severity findings",
      tone: "red",
    },
    {
      title: "Successful reviews",
      icon: Workflow,
      value: stats
        ? reviews.filter((review) => review.status === "completed").length
        : 0,
      note: "Among recent 5 reviews",
      tone: "green",
    },
  ];

  return (
    <>
      <PageHeading
        eyebrow="YOUR REVIEW WORKSPACE"
        title="Welcome to Patchwork"
        description="Here’s what’s happening with your AI code reviewer."
        action={
          <Link className="button button-primary" href="/repositories">
            <GitBranch size={15} />
            View repositories
            <ArrowRight size={14} />
          </Link>
        }
      />

      <div className="welcome-banner">
        <div className="welcome-symbol">
          <Sparkles size={21} />
        </div>
        <div className="welcome-copy">
          <div className="welcome-title">
            Your reviewer is ready when you are
            <span className="status-pill status-ready">
              <i /> Workflow configured
            </span>
          </div>
          <p>
            New pull requests are reviewed automatically as soon as GitHub
            sends them over.
          </p>
        </div>
        <div className="welcome-meta">
          <span>AI model</span>
          <strong>Gemini 3.1 Flash Lite</strong>
        </div>
        <div className="banner-grid" />
      </div>

      {error && (
        <div className="data-note">
          <span>DATA ERROR</span>
          <p>{error}</p>
        </div>
      )}

      <div className="stat-grid">
        {statCards.map(({ title, icon: Icon, value, note, tone }) => (
          <section key={title} className="card stat-card">
            <div className="stat-head">
              <span>{title}</span>
              <span className={`stat-icon ${tone}`}>
                <Icon size={16} />
              </span>
            </div>

            <div className="stat-value">
              {loading ? "..." : value}
            </div>

            <div className="stat-note">
              <span className="muted-dot" />
              {note}
            </div>
          </section>
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="card activity-card">
          <SectionHeader
            title="Recent activity"
            caption="The latest work from your AI reviewer"
            link={
              <Link className="subtle-link" href="/reviews">
                View history <ArrowRight size={13} />
              </Link>
            }
          />

          {loading ? (
            <EmptyState
              icon={Activity}
              title="Loading reviews..."
              description="Fetching your latest review activity."
            />
          ) : reviews.length === 0 ? (
            <EmptyState
              icon={GitPullRequest}
              title="No reviews found"
              description="Your recent reviews will appear here."
            />
          ) : (
            <div className="recent-review-list">
              {reviews.map((review) => (
                <div className="recent-review-row" key={review.id}>
                  <div className="quick-icon">
                    <GitPullRequest size={16} />
                  </div>

                  <div className="recent-review-info">
                    <strong>
                      {review.repository} #{review.pr_number}
                    </strong>
                    <small>
                      {review.pr_title || "Pull request review"}
                    </small>
                    <small>
                      {new Date(review.created_at).toLocaleString()}
                    </small>
                  </div>

                  <div className="recent-review-meta">
                    <span>{review.findings_count} findings</span>
                    <span
                      className={`status-pill ${
                        review.status === "completed"
                          ? "status-ready"
                          : "status-pending"
                      }`}
                    >
                      {review.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="dashboard-side">
          <section className="card chart-card">
            <SectionHeader
              title="Review activity"
              caption="Reviews over the last 30 days"
            />
            <EmptyState
              icon={Activity}
              title="Activity chart coming next"
              description="We'll connect historical review data to this chart."
            />
          </section>

          <section className="card quick-card">
            <SectionHeader
              title="Quick links"
              caption="Jump back into your workspace"
            />
            <Link className="quick-row" href="/repositories">
              <span className="quick-icon">
                <GitBranch size={16} />
              </span>
              <span>
                <strong>Connected repositories</strong>
                <small>Manage repositories under review</small>
              </span>
              <ArrowRight size={15} />
            </Link>

            <Link className="quick-row" href="/analytics">
              <span className="quick-icon">
                <Activity size={16} />
              </span>
              <span>
                <strong>Review analytics</strong>
                <small>Track quality and review trends</small>
              </span>
              <ArrowRight size={15} />
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}


export function RepositoriesPage() {
  return <><PageHeading eyebrow="WORKSPACE" title="Repositories" description="Manage the GitHub repositories connected to your AI reviewer." action={<span className="count-chip"><GitBranch size={14} /> 0 repositories</span>} /><div className="toolbar"><div className="toolbar-label"><GitBranch size={15} /> Connected repositories</div><span className="toolbar-muted">Repository sync API not configured</span></div><section className="card large-empty"><EmptyState icon={Code2} title="No repository data available yet" description="The GitHub App webhook can receive pull requests, but the backend does not currently expose a repository list endpoint. Add repository API support to see your connected projects here." action={<Link className="button button-secondary" href="/settings">View connection status <ArrowRight size={14} /></Link>} /></section><div className="info-strip"><span className="info-mark">i</span><p>Once repository sync is available, you’ll be able to see default branches, review counts, and the last review date for each project.</p></div></>;
}

export function ReviewsPage() {
  return <><PageHeading eyebrow="CODE QUALITY" title="Review history" description="Search and inspect every pull request reviewed by your AI agent." action={<span className="count-chip"><GitPullRequest size={14} /> 0 reviews</span>} /><section className="card filter-card"><div className="search-field"><span className="search-glyph">⌕</span><span>Search pull requests, repositories…</span><kbd>⌘ K</kbd></div><div className="filter-chip">All repositories <ArrowDownRight size={13} /></div><div className="filter-chip">Any severity <ArrowDownRight size={13} /></div><div className="filter-chip">Any status <ArrowDownRight size={13} /></div><div className="filter-chip date-filter"><Clock3 size={13} /> Date range <ArrowDownRight size={13} /></div></section><section className="card large-empty reviews-empty"><EmptyState icon={GitPullRequest} title="Your review history is empty" description="Reviews are posted to GitHub, but they aren’t saved in a database yet. Add backend persistence to search, filter, and revisit past reviews here." action={<Link className="button button-secondary" href="/repositories">Browse repositories <ArrowRight size={14} /></Link>} /></section><div className="results-foot"><span>Showing <strong>0 reviews</strong></span><span>History is unavailable until backend persistence is implemented.</span></div></>;
}

export function ReviewDetailsPage({ id }: { id: string }) {
  return <><PageHeading eyebrow="REVIEW DETAILS" title="Pull request review" description="Inspect the AI summary and line-by-line findings for this review." action={<Link className="button button-secondary" href="/reviews"><ArrowRight className="back-arrow" size={14} /> All reviews</Link>} /><section className="card large-empty detail-empty"><div className="detail-skeleton"><span className="skeleton-label">REVIEW ID</span><code>{id}</code></div><EmptyState icon={GitPullRequest} title="This review isn’t available" description="Review details are not persisted by the backend yet. When review records and findings are stored, this page will show the summary and findings grouped by severity." action={<Link className="button button-secondary" href="/reviews">Return to review history <ArrowRight size={14} /></Link>} /></section><div className="severity-placeholder">{["Critical", "High", "Medium", "Low"].map((severity, i) => <div className="severity-row" key={severity}><span className={`severity-dot severity-${i}`} /><strong>{severity}</strong><span>Findings will appear when review history is available</span><span className="severity-count">—</span></div>)}</div></>;
}

export function AnalyticsPage() {
  return <><PageHeading eyebrow="INSIGHTS" title="Analytics" description="Understand review quality, issue patterns, and how your projects evolve." action={<span className="count-chip"><Clock3 size={14} /> Last 30 days</span>} /><div className="analytics-empty-grid"><section className="card analytics-empty"><SectionHeader title="Review activity" caption="Pull requests reviewed over time" /><EmptyState icon={Activity} title="No activity to chart" description="Persisted review records are needed to calculate this trend." /></section><section className="card analytics-empty"><SectionHeader title="Issues by severity" caption="Findings across all reviews" /><EmptyState icon={Bug} title="No finding data yet" description="Severity breakdowns appear once findings are stored." /></section><section className="card analytics-empty repo-analytics"><SectionHeader title="Most reviewed repositories" caption="Where your agent spends its time" /><EmptyState icon={GitBranch} title="No repository activity" description="Repository and review history endpoints will power this list." /></section></div><div className="data-note"><span><i /> LIVE DATA ONLY</span><p>Analytics are intentionally blank until the backend can provide persisted reviews and findings.</p></div></>;
}

export function SettingsPage() {
  const model = process.env.NEXT_PUBLIC_AI_MODEL || "Gemini 3.1 Flash Lite";
  return <><PageHeading eyebrow="PREFERENCES" title="Settings" description="Check your integrations and configure your review workspace." /><div className="settings-layout"><div className="settings-main"><section className="card settings-card"><div className="settings-card-head"><div><h2>Integrations</h2><p>Connections used by your AI PR review agent.</p></div><span className="settings-head-icon"><GitBranch size={17} /></span></div><div className="integration-row"><div className="integration-logo github-logo"><GitBranch size={18} /></div><div className="integration-copy"><strong>GitHub App</strong><span>Pull request webhooks and review comments</span></div><span className="status-pill status-unknown"><i /> Status unverified</span></div><div className="integration-row"><div className="integration-logo api-logo"><Activity size={18} /></div><div className="integration-copy"><strong>Review API</strong><span>Dashboard data and review history</span></div><span className="status-pill status-pending"><i /> Not available</span></div></section><section className="card settings-card"><div className="settings-card-head"><div><h2>AI reviewer</h2><p>Model information from the deployed review service.</p></div><span className="settings-head-icon"><Sparkles size={17} /></span></div><div className="setting-value-row"><div><span className="setting-label">Model</span><strong>{model}</strong></div><span className="model-badge">GEMINI</span></div><div className="setting-divider" /><div className="setting-value-row"><div><span className="setting-label">Provider</span><strong>Google AI</strong></div><span className="setting-readonly">Managed by backend</span></div></section><section className="card settings-card"><div className="settings-card-head"><div><h2>Account</h2><p>Workspace profile for this dashboard.</p></div><span className="settings-head-icon"><Code2 size={17} /></span></div><div className="account-detail"><div className="avatar avatar-large">W</div><div><strong>No signed-in account</strong><span>Authentication not configured</span></div></div><div className="settings-footnote">Account authentication is not configured in this frontend yet.</div></section></div><aside className="settings-aside"><section className="card connection-card"><div className="connection-top"><div className="connection-icon"><Activity size={18} /></div><span className="status-pill status-pending"><i /> Pending setup</span></div><h3>Backend connection</h3><p>The dashboard checks the FastAPI health endpoint. Set the API URL to see whether your service is reachable.</p><div className="connection-url"><span>API endpoint</span><code>{process.env.NEXT_PUBLIC_API_URL || "Not configured"}</code></div><div className="connection-help"><span>?</span><p>Configure <code>NEXT_PUBLIC_API_URL</code> in <code>.env.local</code> and restart the dev server.</p></div></section><section className="card security-card"><ShieldCheck size={17} /><div><strong>Your credentials stay safe</strong><p>API keys, webhook secrets, and GitHub private keys remain on the backend. This dashboard never requests them.</p></div></section><div className="settings-note"><ArrowUpRight size={14} /> Integration details reflect available frontend configuration, not a live GitHub account audit.</div></aside></div></>;
}

export function NotFoundReview({ id }: { id: string }) { return <ReviewDetailsPage id={id} />; }
