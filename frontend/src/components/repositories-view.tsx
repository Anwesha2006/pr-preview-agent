"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Code2,
  ExternalLink,
  GitBranch,
  Info,
} from "lucide-react";
import { getAllReviews, type RecentReview } from "@/lib/api";
import { PageHeader, EmptyState } from "@/components/ui-components";

export function RepositoriesView() {
  const [reviews, setReviews] = useState<RecentReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        setLoading(true);
        const r = await getAllReviews();
        if (alive) setReviews(r);
      } catch (err) {
        console.error(err);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  // Compute repository metadata from real review history
  const repoMap = new Map<
    string,
    {
      name: string;
      reviewCount: number;
      findingsCount: number;
      lastReviewDate: string;
      latestPrUrl: string | null;
    }
  >();

  reviews.forEach((review) => {
    const existing = repoMap.get(review.repository);
    if (!existing) {
      repoMap.set(review.repository, {
        name: review.repository,
        reviewCount: 1,
        findingsCount: review.findings_count,
        lastReviewDate: review.created_at,
        latestPrUrl: review.pr_url,
      });
    } else {
      existing.reviewCount += 1;
      existing.findingsCount += review.findings_count;
      if (new Date(review.created_at) > new Date(existing.lastReviewDate)) {
        existing.lastReviewDate = review.created_at;
        if (review.pr_url) existing.latestPrUrl = review.pr_url;
      }
    }
  });

  const discoveredRepos = Array.from(repoMap.values());

  return (
    <>
      <PageHeader
        eyebrow="Connected Projects"
        title="Repositories"
        description="GitHub repositories actively monitored and audited by the AI review agent."
        actions={
          <div className="topbar-env-pill">
            <GitBranch size={13} style={{ color: "var(--accent-saffron)" }} />
            <span>
              <strong>{discoveredRepos.length}</strong> Active Repositories
            </span>
          </div>
        }
      />

      {/* Honest Architectural Context Banner */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          padding: "16px 20px",
          background: "var(--panel)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-lg)",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "var(--radius-sm)",
            background: "var(--panel-secondary)",
            border: "1px solid var(--line)",
            display: "grid",
            placeItems: "center",
            color: "var(--accent-saffron)",
            flexShrink: 0,
            marginTop: 2,
          }}
        >
          <Info size={16} />
        </div>
        <div>
          <strong
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: 4,
            }}
          >
            Webhook Ingestion Architecture
          </strong>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Repositories are enrolled dynamically when GitHub sends pull request webhooks
            (<code>pull_request.opened</code>, <code>pull_request.synchronize</code>).
            The repositories listed below reflect live projects recorded in PostgreSQL from real reviews.
            A dedicated standalone GitHub App repository sync endpoint is not yet exposed by the backend.
          </p>
        </div>
      </div>

      {/* Repository Listing Card */}
      <section className="card">
        <div className="card-header">
          <div className="card-title-group">
            <h2 className="card-title">Enrolled Repositories ({discoveredRepos.length})</h2>
            <p className="card-subtitle">
              Projects with active PR review histories in the database
            </p>
          </div>
          <Link href="/settings" className="btn btn-ghost" style={{ fontSize: 11, padding: "0 8px" }}>
            Webhook Settings <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: 24 }}>
            {[1, 2].map((i) => (
              <div
                key={i}
                style={{
                  height: 64,
                  background: "rgba(255, 255, 255, 0.02)",
                  borderRadius: 8,
                  marginBottom: 10,
                }}
              />
            ))}
          </div>
        ) : discoveredRepos.length === 0 ? (
          <EmptyState
            icon={Code2}
            title="No repository activity recorded yet"
            description="The GitHub App webhook is configured to receive pull requests, but no reviews have been processed yet. Install the GitHub App on your target repositories to see them appear here."
            action={
              <Link href="/settings" className="btn btn-secondary">
                View Integration Settings
                <ArrowRight size={13} />
              </Link>
            }
          />
        ) : (
          <div>
            {discoveredRepos.map((repo, idx) => {
              const lastDate = new Date(repo.lastReviewDate).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }
              );

              // derive github link if repo name is formatted like owner/repo
              const githubUrl = repo.name.includes("/")
                ? `https://github.com/${repo.name}`
                : null;

              return (
                <div
                  key={repo.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "18px 24px",
                    borderBottom:
                      idx === discoveredRepos.length - 1
                        ? "none"
                        : "1px solid var(--line-soft)",
                    gap: 20,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "var(--radius-md)",
                        background: "var(--panel-secondary)",
                        border: "1px solid var(--line)",
                        display: "grid",
                        placeItems: "center",
                        color: "var(--accent-saffron)",
                        flexShrink: 0,
                      }}
                    >
                      <GitBranch size={18} />
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <strong
                          style={{
                            fontSize: 13.5,
                            fontWeight: 600,
                            color: "var(--text-primary)",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {repo.name}
                        </strong>
                        <span
                          className="status-badge completed"
                          style={{ fontSize: 9.5, padding: "1px 6px" }}
                        >
                          Webhook Synced
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          marginTop: 4,
                          fontSize: 11,
                          color: "var(--text-secondary)",
                        }}
                      >
                        <span>Last reviewed: {lastDate}</span>
                        <span>·</span>
                        <span>{repo.reviewCount} total reviews</span>
                        <span>·</span>
                        <span>{repo.findingsCount} findings flagged</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {githubUrl && (
                      <a
                        href={githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                        style={{ height: 32, fontSize: 11, padding: "0 10px" }}
                      >
                        <span>GitHub</span>
                        <ExternalLink size={12} />
                      </a>
                    )}

                    <Link
                      href={`/reviews?repo=${encodeURIComponent(repo.name)}`}
                      className="btn btn-primary"
                      style={{ height: 32, fontSize: 11, padding: "0 12px" }}
                    >
                      <span>Inspect Reviews</span>
                      <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
