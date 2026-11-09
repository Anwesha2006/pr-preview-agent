"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Bug,
  ChevronRight,
  GitPullRequest,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";
import { getAllReviews, type RecentReview } from "@/lib/api";
import { PageHeader, EmptyState, StatusBadge } from "@/components/ui-components";

export function ReviewHistory() {
  const [reviews, setReviews] = useState<RecentReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [search, setSearch] = useState("");
  const [selectedRepo, setSelectedRepo] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "most_findings">("newest");

  useEffect(() => {
    let alive = true;
    async function loadReviews() {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllReviews();
        if (alive) setReviews(data);
      } catch (err) {
        if (alive) {
          setError(
            err instanceof Error ? err.message : "Failed to load review history"
          );
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadReviews();
    return () => {
      alive = false;
    };
  }, []);

  // Distinct repositories from loaded reviews
  const repositories = useMemo(() => {
    return Array.from(new Set(reviews.map((r) => r.repository))).filter(Boolean);
  }, [reviews]);

  // Filtered & sorted reviews
  const filteredReviews = useMemo(() => {
    const result = reviews.filter((review) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        review.repository.toLowerCase().includes(q) ||
        (review.pr_title ?? "").toLowerCase().includes(q) ||
        String(review.pr_number).includes(q);

      const matchesRepo = selectedRepo === "all" || review.repository === selectedRepo;
      const matchesStatus = selectedStatus === "all" || review.status === selectedStatus;

      const matchesSeverity =
        selectedSeverity === "all" ||
        (selectedSeverity === "with_findings" && review.findings_count > 0) ||
        (selectedSeverity === "clean" && review.findings_count === 0);

      return matchesSearch && matchesRepo && matchesStatus && matchesSeverity;
    });

    return result.sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortOrder === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortOrder === "most_findings") {
        return b.findings_count - a.findings_count;
      }
      return 0;
    });
  }, [reviews, search, selectedRepo, selectedStatus, selectedSeverity, sortOrder]);

  const hasActiveFilters =
    search.trim() !== "" ||
    selectedRepo !== "all" ||
    selectedStatus !== "all" ||
    selectedSeverity !== "all" ||
    sortOrder !== "newest";

  const clearFilters = () => {
    setSearch("");
    setSelectedRepo("all");
    setSelectedStatus("all");
    setSelectedSeverity("all");
    setSortOrder("newest");
  };

  return (
    <>
      <PageHeader
        eyebrow="Review Management"
        title="Review History"
        description="Search, filter, and inspect line-level automated pull request audits."
        actions={
          <div
            className="topbar-env-pill"
            style={{ fontSize: 11, padding: "5px 12px" }}
          >
            <GitPullRequest size={13} style={{ color: "var(--accent-saffron)" }} />
            <span>
              <strong>{reviews.length}</strong> Total Reviews
            </span>
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
          <button
            onClick={() => window.location.reload()}
            className="btn btn-secondary"
            style={{ height: 26, marginLeft: "auto", fontSize: 11, padding: "0 8px" }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="filter-bar">
        {/* Search Input */}
        <div className="search-input-wrap">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search by repo, PR # or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{ color: "var(--text-muted)" }}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Repository Filter */}
        <select
          className="filter-select"
          value={selectedRepo}
          onChange={(e) => setSelectedRepo(e.target.value)}
          title="Filter by repository"
        >
          <option value="all">All Repositories</option>
          {repositories.map((repo) => (
            <option key={repo} value={repo}>
              {repo}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          className="filter-select"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          title="Filter by status"
        >
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>

        {/* Severity / Findings Filter */}
        <select
          className="filter-select"
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
          title="Filter by findings"
        >
          <option value="all">All Findings</option>
          <option value="with_findings">Has Findings (&gt; 0)</option>
          <option value="clean">Clean (0 Findings)</option>
        </select>

        {/* Sort Order */}
        <select
          className="filter-select"
          value={sortOrder}
          onChange={(e) =>
            setSortOrder(
              e.target.value as "newest" | "oldest" | "most_findings"
            )
          }
          title="Sort order"
        >
          <option value="newest">Sort: Newest first</option>
          <option value="oldest">Sort: Oldest first</option>
          <option value="most_findings">Sort: Most findings</option>
        </select>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="btn btn-ghost"
            style={{ height: 36, fontSize: 11, gap: 5, padding: "0 10px" }}
            title="Reset all filters"
          >
            <RotateCcw size={13} />
            Clear filters
          </button>
        )}
      </div>

      {/* Review List Card */}
      <section className="card">
        <div className="card-header">
          <div className="card-title-group">
            <h2 className="card-title">
              {hasActiveFilters
                ? `Filtered Reviews (${filteredReviews.length} of ${reviews.length})`
                : `All Reviews (${reviews.length})`}
            </h2>
            <p className="card-subtitle">
              Click any row to open the line-by-line inspection report
            </p>
          </div>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
            PostgreSQL Database Sync
          </span>
        </div>

        {loading ? (
          <div style={{ padding: 24 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                style={{
                  height: 60,
                  background: "rgba(255, 255, 255, 0.02)",
                  borderRadius: 8,
                  marginBottom: 10,
                }}
              />
            ))}
          </div>
        ) : filteredReviews.length === 0 ? (
          <EmptyState
            icon={GitPullRequest}
            title={hasActiveFilters ? "No matching reviews found" : "No review history available"}
            description={
              hasActiveFilters
                ? "Try adjusting your search criteria or resetting the active filters above."
                : "Pull requests will automatically appear here once webhook events are dispatched from GitHub."
            }
            action={
              hasActiveFilters ? (
                <button onClick={clearFilters} className="btn btn-secondary">
                  <RotateCcw size={13} />
                  Reset all filters
                </button>
              ) : undefined
            }
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {filteredReviews.map((review) => {
              const date = new Date(review.created_at);
              const formattedDate = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              const isClean = review.findings_count === 0;

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
                          {review.pr_title || "Pull request review"}
                        </span>
                      </div>
                      <div className="review-row-subline">
                        <span>{formattedDate}</span>
                        <span>·</span>
                        <span>{review.comments_posted} comments posted</span>
                        <span>·</span>
                        <span style={{ fontFamily: "var(--font-mono)" }}>
                          ID: #{review.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="review-row-meta">
                    {/* Severity / Finding Indicator */}
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "3px 9px",
                        borderRadius: "var(--radius-sm)",
                        background: isClean
                          ? "var(--green-muted)"
                          : "var(--accent-saffron-muted)",
                        border: `1px solid ${
                          isClean
                            ? "var(--green-border)"
                            : "var(--accent-saffron-border)"
                        }`,
                        color: isClean ? "#6EE7B7" : "var(--accent-saffron)",
                        fontSize: 11,
                        fontWeight: 500,
                      }}
                    >
                      {isClean ? (
                        <>
                          <ShieldCheck size={13} />
                          <span>Clean PR</span>
                        </>
                      ) : (
                        <>
                          <Bug size={13} />
                          <span>
                            {review.findings_count}{" "}
                            {review.findings_count === 1
                              ? "Finding"
                              : "Findings"}
                          </span>
                        </>
                      )}
                    </div>

                    <StatusBadge status={review.status} />
                    <ChevronRight
                      size={16}
                      style={{ color: "var(--text-muted)" }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Results footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 11,
          color: "var(--text-muted)",
          marginTop: 14,
          padding: "0 4px",
        }}
      >
        <span>
          Showing <strong>{filteredReviews.length}</strong> of{" "}
          <strong>{reviews.length}</strong> reviews
        </span>
        <span>Connected to FastAPI PostgreSQL DB</span>
      </div>
    </>
  );
}
