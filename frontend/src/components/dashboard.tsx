"use client";

import { useEffect, useState, useMemo } from "react";
import {getDashboardStats,getRecentReviews,getReviewDetails,getAllReviews,getDashboardAnalytics,type DashboardStats,type RecentReview,type ReviewDetails,type DashboardAnalytics,} from "@/lib/api";import Link from "next/link";
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
  const [reviews, setReviews] = useState<RecentReview[]>([]);
  const [search, setSearch] = useState("");
  const [repository, setRepository] = useState("all");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReviews() {
      try {
        setLoading(true);
        setError(null);

        const data = await getAllReviews();
        setReviews(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load review history"
        );
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
  }, []);

  const repositories = useMemo(
    () => [...new Set(reviews.map((review) => review.repository))],
    [reviews]
  );

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        review.repository.toLowerCase().includes(searchText) ||
        (review.pr_title ?? "").toLowerCase().includes(searchText) ||
        String(review.pr_number).includes(searchText);

      const matchesRepository =
        repository === "all" || review.repository === repository;

      const matchesStatus =
        status === "all" || review.status === status;

      return matchesSearch && matchesRepository && matchesStatus;
    });
  }, [reviews, search, repository, status]);

  return (
    <>
      <PageHeading
        eyebrow="CODE QUALITY"
        title="Review history"
        description="Search and inspect every pull request reviewed by your AI agent."
        action={
          <span className="count-chip">
            <GitPullRequest size={14} />
            {reviews.length} reviews
          </span>
        }
      />

      <section className="card filter-card">
        <div className="search-field">
          <span className="search-glyph">⌕</span>
          <input
            type="text"
            placeholder="Search pull requests, repositories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              minWidth: 0,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "inherit",
            }}
          />
        </div>

        <select
          className="filter-chip"
          value={repository}
          onChange={(e) => setRepository(e.target.value)}
        >
          <option value="all">All repositories</option>
          {repositories.map((repo) => (
            <option key={repo} value={repo}>
              {repo}
            </option>
          ))}
        </select>

        <select
          className="filter-chip"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">Any status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </section>

      {error && (
        <div className="data-note">
          <span>DATA ERROR</span>
          <p>{error}</p>
        </div>
      )}

      <section className="card large-empty reviews-empty">
        {loading ? (
          <EmptyState
            icon={Activity}
            title="Loading review history..."
            description="Fetching saved reviews from PostgreSQL."
          />
        ) : filteredReviews.length === 0 ? (
          <EmptyState
            icon={GitPullRequest}
            title="No matching reviews"
            description="Try changing your search or filters."
          />
        ) : (
          <div className="review-history-list">
            {filteredReviews.map((review) => (
              <Link
                key={review.id}
                href={`/reviews/${review.id}`}
                className="recent-review-row"
              >
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
                  <span className="status-pill status-ready">
                    {review.status}
                  </span>
                </div>

                <ArrowRight size={15} />
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="results-foot">
        <span>
          Showing <strong>{filteredReviews.length} of {reviews.length} reviews</strong>
        </span>
        <span>Review history synced from PostgreSQL.</span>
      </div>
    </>
  );
}



export function ReviewDetailsPage({ id }: { id: string }) {
  const [review, setReview] = useState<ReviewDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReview() {
      try {
        setLoading(true);
        setError(null);

        const data = await getReviewDetails(id);
        setReview(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load review details"
        );
      } finally {
        setLoading(false);
      }
    }

    loadReview();
  }, [id]);

  return (
    <>
      <PageHeading
        eyebrow="REVIEW DETAILS"
        title={review?.pr_title || "Pull request review"}
        description={
          review
            ? `${review.repository} · PR #${review.pr_number}`
            : "Inspect the AI summary and line-by-line findings."
        }
        action={
          <Link className="button button-secondary" href="/reviews">
            <ArrowRight className="back-arrow" size={14} />
            All reviews
          </Link>
        }
      />

      {loading ? (
        <section className="card large-empty">
          <EmptyState
            icon={Activity}
            title="Loading review details..."
            description="Fetching review information from PostgreSQL."
          />
        </section>
      ) : error ? (
        <section className="card large-empty">
          <EmptyState
            icon={GitPullRequest}
            title="Unable to load review"
            description={error}
            action={
              <Link className="button button-secondary" href="/reviews">
                Return to review history
              </Link>
            }
          />
        </section>
      ) : review ? (
        <>
          <section className="card settings-card">
            <div className="settings-card-head">
              <div>
                <h2>Review summary</h2>
                <p>{review.repository} · PR #{review.pr_number}</p>
              </div>
              <span className="status-pill status-ready">
                {review.status}
              </span>
            </div>

            <p>
              {review.summary || "No AI summary was saved for this review."}
            </p>

            {review.pr_url && (
              <a
                className="subtle-link"
                href={review.pr_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                View pull request on GitHub <ArrowUpRight size={14} />
              </a>
            )}

            <div className="setting-divider" />

            <div className="stat-grid">
              <div>
                <span className="setting-label">Findings</span>
                <strong>{review.findings_count}</strong>
              </div>
              <div>
                <span className="setting-label">Comments posted</span>
                <strong>{review.comments_posted}</strong>
              </div>
            </div>
          </section>

          <section className="card settings-card">
            <SectionHeader
              title="Code findings"
              caption="Issues identified by your AI reviewer"
            />

            {review.findings.length === 0 ? (
              <EmptyState
                icon={ShieldCheck}
                title="No findings"
                description="No code issues were identified in this review."
              />
            ) : (
              <div className="finding-list">
                {review.findings.map((finding) => (
                  <article className="finding-item" key={finding.id}>
                    <div className="finding-heading">
                      <strong>{finding.file_path}</strong>
                      <span
                        className={`status-pill severity-${finding.severity.toLowerCase()}`}
                      >
                        {finding.severity}
                      </span>
                    </div>

                    <p className="finding-line">
                      Line {finding.line_number ?? "Not specified"}
                    </p>

                    <p>{finding.issue}</p>

                    {finding.suggestion && (
                      <div className="finding-suggestion">
                        <strong>Suggested fix</strong>
                        <p>{finding.suggestion}</p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>

          <div className="results-foot">
            <span>
              Review ID: <strong>{review.id}</strong>
            </span>
            <span>
              {new Date(review.created_at).toLocaleString()}
            </span>
          </div>
        </>
      ) : null}
    </>
  );
}



export function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        setError(null);
        const data = await getDashboardAnalytics();
        setAnalytics(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load analytics"
        );
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  const severity = analytics?.severity_breakdown ?? {};
  const totalFindings =
    (severity.high ?? 0) +
    (severity.medium ?? 0) +
    (severity.low ?? 0);

  const maxDailyReviews = Math.max(
    1,
    ...(analytics?.daily_reviews.map((item) => item.count) ?? [])
  );

  return (
    <>
      <PageHeading
        eyebrow="INSIGHTS"
        title="Analytics"
        description="Understand review quality, issue patterns, and how your projects evolve."
        action={
          <span className="count-chip">
            <Clock3 size={14} /> Last 30 days
          </span>
        }
      />

      {error && (
        <div className="data-note">
          <span>DATA ERROR</span>
          <p>{error}</p>
        </div>
      )}

      <div className="analytics-empty-grid">
        <section className="card analytics-empty">
          <SectionHeader
            title="Review activity"
            caption="Pull requests reviewed over the last 30 days"
          />

          {loading ? (
            <p>Loading review activity...</p>
          ) : analytics?.daily_reviews.length ? (
            <div className="analytics-list">
              {analytics.daily_reviews.map((item) => (
                <div className="analytics-row" key={item.date}>
                  <span>{item.date}</span>
                  <div className="analytics-bar-track">
                    <div
                      className="analytics-bar"
                      style={{
                        width: `${(item.count / maxDailyReviews) * 100}%`,
                      }}
                    />
                  </div>
                  <strong>{item.count}</strong>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Activity}
              title="No recent activity"
              description="No reviews were recorded in the last 30 days."
            />
          )}
        </section>

        <section className="card analytics-empty">
          <SectionHeader
            title="Issues by severity"
            caption="Findings across all reviews"
          />

          {loading ? (
            <p>Loading severity data...</p>
          ) : (
            <div className="severity-list">
              {[
                { name: "High", count: severity.high ?? 0 },
                { name: "Medium", count: severity.medium ?? 0 },
                { name: "Low", count: severity.low ?? 0 },
              ].map((item) => (
                <div className="severity-row" key={item.name}>
                  <strong>{item.name}</strong>
                  <div className="analytics-bar-track">
                    <div
                      className="analytics-bar"
                      style={{
                        width: `${
                          totalFindings
                            ? (item.count / totalFindings) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="severity-count">{item.count}</span>
                </div>
              ))}
              <p>Total findings: {totalFindings}</p>
            </div>
          )}
        </section>

        <section className="card analytics-empty repo-analytics">
          <SectionHeader
            title="Most reviewed repositories"
            caption="Where your agent spends its time"
          />

          {loading ? (
            <p>Loading repositories...</p>
          ) : analytics?.top_repositories.length ? (
            <div className="analytics-list">
              {analytics.top_repositories.map((repo) => (
                <div className="analytics-row" key={repo.repository}>
                  <span>{repo.repository}</span>
                  <strong>{repo.review_count} reviews</strong>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={GitBranch}
              title="No repository activity"
              description="Repository statistics will appear here."
            />
          )}
        </section>
      </div>

      <div className="data-note">
        <span><i /> LIVE DATA</span>
        <p>Analytics are calculated from persisted PostgreSQL reviews and findings.</p>
      </div>
    </>
  );
}


export function SettingsPage() {
  const model = process.env.NEXT_PUBLIC_AI_MODEL || "Gemini 3.1 Flash Lite";
  return <><PageHeading eyebrow="PREFERENCES" title="Settings" description="Check your integrations and configure your review workspace." /><div className="settings-layout"><div className="settings-main"><section className="card settings-card"><div className="settings-card-head"><div><h2>Integrations</h2><p>Connections used by your AI PR review agent.</p></div><span className="settings-head-icon"><GitBranch size={17} /></span></div><div className="integration-row"><div className="integration-logo github-logo"><GitBranch size={18} /></div><div className="integration-copy"><strong>GitHub App</strong><span>Pull request webhooks and review comments</span></div><span className="status-pill status-unknown"><i /> Status unverified</span></div><div className="integration-row"><div className="integration-logo api-logo"><Activity size={18} /></div><div className="integration-copy"><strong>Review API</strong><span>Dashboard data and review history</span></div><span className="status-pill status-pending"><i /> Not available</span></div></section><section className="card settings-card"><div className="settings-card-head"><div><h2>AI reviewer</h2><p>Model information from the deployed review service.</p></div><span className="settings-head-icon"><Sparkles size={17} /></span></div><div className="setting-value-row"><div><span className="setting-label">Model</span><strong>{model}</strong></div><span className="model-badge">GEMINI</span></div><div className="setting-divider" /><div className="setting-value-row"><div><span className="setting-label">Provider</span><strong>Google AI</strong></div><span className="setting-readonly">Managed by backend</span></div></section><section className="card settings-card"><div className="settings-card-head"><div><h2>Account</h2><p>Workspace profile for this dashboard.</p></div><span className="settings-head-icon"><Code2 size={17} /></span></div><div className="account-detail"><div className="avatar avatar-large">W</div><div><strong>No signed-in account</strong><span>Authentication not configured</span></div></div><div className="settings-footnote">Account authentication is not configured in this frontend yet.</div></section></div><aside className="settings-aside"><section className="card connection-card"><div className="connection-top"><div className="connection-icon"><Activity size={18} /></div><span className="status-pill status-pending"><i /> Pending setup</span></div><h3>Backend connection</h3><p>The dashboard checks the FastAPI health endpoint. Set the API URL to see whether your service is reachable.</p><div className="connection-url"><span>API endpoint</span><code>{process.env.NEXT_PUBLIC_API_URL || "Not configured"}</code></div><div className="connection-help"><span>?</span><p>Configure <code>NEXT_PUBLIC_API_URL</code> in <code>.env.local</code> and restart the dev server.</p></div></section><section className="card security-card"><ShieldCheck size={17} /><div><strong>Your credentials stay safe</strong><p>API keys, webhook secrets, and GitHub private keys remain on the backend. This dashboard never requests them.</p></div></section><div className="settings-note"><ArrowUpRight size={14} /> Integration details reflect available frontend configuration, not a live GitHub account audit.</div></aside></div></>;
}

export function NotFoundReview({ id }: { id: string }) { return <ReviewDetailsPage id={id} />; }
