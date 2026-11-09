"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  FileCode,
  GitCommit,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { getReviewDetails, type ReviewDetails } from "@/lib/api";
import { EmptyState, StatusBadge, SeverityBadge } from "@/components/ui-components";

export function ReviewDetailsView({ id }: { id: string }) {
  const [review, setReview] = useState<ReviewDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedSha, setCopiedSha] = useState(false);
  const [copiedFixId, setCopiedFixId] = useState<number | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await getReviewDetails(id);
        if (alive) setReview(data);
      } catch (err) {
        if (alive) {
          setError(
            err instanceof Error ? err.message : "Failed to load review details"
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
  }, [id]);

  const copySha = (sha: string) => {
    navigator.clipboard.writeText(sha);
    setCopiedSha(true);
    setTimeout(() => setCopiedSha(false), 2000);
  };

  const copyFix = (findingId: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedFixId(findingId);
    setTimeout(() => setCopiedFixId(null), 2000);
  };

  const findings = useMemo(() => review?.findings ?? [], [review?.findings]);

  const severityCounts = useMemo(() => {
    const counts: Record<string, number> = { high: 0, medium: 0, low: 0, critical: 0 };
    findings.forEach((f) => {
      const s = (f.severity || "low").toLowerCase();
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [findings]);

  const filteredFindings = useMemo(() => {
    if (severityFilter === "all") return findings;
    return findings.filter(
      (f) => (f.severity || "low").toLowerCase() === severityFilter.toLowerCase()
    );
  }, [findings, severityFilter]);

  if (loading) {
    return (
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ height: 40, width: 200, background: "rgba(255,255,255,0.03)", borderRadius: 6, marginBottom: 20 }} />
        <div style={{ height: 160, background: "rgba(255,255,255,0.02)", borderRadius: 12, marginBottom: 20 }} />
        <div style={{ height: 300, background: "rgba(255,255,255,0.02)", borderRadius: 12 }} />
      </div>
    );
  }

  if (error || !review) {
    return (
      <section className="card" style={{ maxWidth: 800, margin: "40px auto", padding: 32 }}>
        <EmptyState
          icon={ShieldAlert}
          title="Review Not Found"
          description={error || "Could not retrieve the requested pull request review."}
          action={
            <Link href="/reviews" className="btn btn-secondary">
              <ArrowLeft size={14} /> Back to Review History
            </Link>
          }
        />
      </section>
    );
  }

  const reviewDate = new Date(review.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1150, margin: "0 auto" }}>
      {/* Top Navigation Row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link
          href="/reviews"
          className="btn btn-ghost"
          style={{ paddingLeft: 0, gap: 6, fontSize: 12 }}
        >
          <ArrowLeft size={14} />
          Back to Review History
        </Link>

        {review.pr_url && (
          <a
            href={review.pr_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ fontSize: 12 }}
          >
            <span>View on GitHub</span>
            <ExternalLink size={13} />
          </a>
        )}
      </div>

      {/* Review Header Banner */}
      <div className="card" style={{ padding: "24px 28px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span
                style={{
                  fontSize: 12,
                  fontFamily: "var(--font-mono)",
                  color: "var(--accent-saffron)",
                  fontWeight: 600,
                  background: "var(--accent-saffron-muted)",
                  padding: "2px 8px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--accent-saffron-border)",
                }}
              >
                {review.repository} #{review.pr_number}
              </span>
              <StatusBadge status={review.status} />
            </div>

            <h1
              style={{
                fontSize: 22,
                fontWeight: 600,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
                lineHeight: 1.3,
              }}
            >
              {review.pr_title || `Pull Request #${review.pr_number}`}
            </h1>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 16,
                marginTop: 12,
                fontSize: 12,
                color: "var(--text-secondary)",
              }}
            >
              <span>Reviewed on {reviewDate}</span>
              {review.head_sha && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <GitCommit size={14} style={{ color: "var(--text-muted)" }} />
                  <code
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      background: "var(--panel-secondary)",
                      padding: "2px 6px",
                      borderRadius: 4,
                      border: "1px solid var(--line)",
                    }}
                  >
                    {review.head_sha.slice(0, 7)}
                  </code>
                  <button
                    onClick={() => copySha(review.head_sha!)}
                    style={{ color: "var(--text-muted)" }}
                    title="Copy full commit SHA"
                  >
                    {copiedSha ? <Check size={13} style={{ color: "var(--green-success)" }} /> : <Copy size={13} />}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics Pillar */}
          <div
            style={{
              display: "flex",
              gap: 20,
              padding: "12px 18px",
              background: "var(--panel-secondary)",
              border: "1px solid var(--line)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 10.5, color: "var(--text-muted)", textTransform: "uppercase" }}>
                Total Findings
              </span>
              <strong style={{ fontSize: 20, color: review.findings_count > 0 ? "var(--accent-saffron)" : "var(--green-success)" }}>
                {review.findings_count}
              </strong>
            </div>

            <div style={{ width: 1, background: "var(--line)" }} />

            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 10.5, color: "var(--text-muted)", textTransform: "uppercase" }}>
                Comments Posted
              </span>
              <strong style={{ fontSize: 20, color: "var(--text-primary)" }}>
                {review.comments_posted}
              </strong>
            </div>

            <div style={{ width: 1, background: "var(--line)" }} />

            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 10.5, color: "var(--text-muted)", textTransform: "uppercase" }}>
                High Severity
              </span>
              <strong style={{ fontSize: 20, color: severityCounts.high > 0 ? "var(--red-error)" : "var(--text-muted)" }}>
                {severityCounts.high}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* AI Summary Card */}
      <section className="card" style={{ padding: "22px 26px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "var(--radius-sm)",
              background: "var(--accent-saffron-muted)",
              border: "1px solid var(--accent-saffron-border)",
              display: "grid",
              placeItems: "center",
              color: "var(--accent-saffron)",
            }}
          >
            <Sparkles size={15} />
          </div>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
              AI Executive Summary
            </h2>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
              Synthesized by Gemini 3.1 Flash Lite
            </span>
          </div>
        </div>

        <p
          style={{
            fontSize: 13.5,
            color: "var(--text-primary)",
            lineHeight: 1.6,
            background: "rgba(255, 255, 255, 0.02)",
            padding: "14px 18px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--line-soft)",
          }}
        >
          {review.summary || "No automated summary was recorded for this review run."}
        </p>
      </section>

      {/* Code Findings Section */}
      <section className="card">
        <div className="card-header" style={{ flexWrap: "wrap", gap: 12 }}>
          <div className="card-title-group">
            <h2 className="card-title">Code Findings ({findings.length})</h2>
            <p className="card-subtitle">
              Defects, logic regressions, and security issues detected in this PR
            </p>
          </div>

          {/* Severity Filter Tabs */}
          {findings.length > 0 && (
            <div style={{ display: "flex", gap: 6 }}>
              {[
                { id: "all", label: `All (${findings.length})` },
                { id: "high", label: `High (${severityCounts.high})` },
                { id: "medium", label: `Medium (${severityCounts.medium})` },
                { id: "low", label: `Low (${severityCounts.low})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSeverityFilter(tab.id)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: 11,
                    fontWeight: 500,
                    background:
                      severityFilter === tab.id
                        ? "var(--panel-secondary)"
                        : "transparent",
                    border: `1px solid ${
                      severityFilter === tab.id
                        ? "var(--line-strong)"
                        : "transparent"
                    }`,
                    color:
                      severityFilter === tab.id
                        ? "var(--text-primary)"
                        : "var(--text-secondary)",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {findings.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="Clean Pull Request — Zero Findings"
            description="The AI reviewer thoroughly analyzed the patch and found no defects, logical flaws, or critical regressions. Safe to merge!"
          />
        ) : filteredFindings.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No findings matching this severity filter"
            description="Try selecting a different filter above to inspect other findings."
            action={
              <button onClick={() => setSeverityFilter("all")} className="btn btn-secondary">
                View all findings
              </button>
            }
          />
        ) : (
          <div>
            {filteredFindings.map((finding) => (
              <article key={finding.id} className="finding-card">
                <div className="finding-card-header">
                  <div className="finding-file-meta">
                    <FileCode size={15} style={{ color: "var(--text-secondary)" }} />
                    <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                      {finding.file_path}
                    </span>
                    {finding.line_number && (
                      <span className="finding-line-tag">
                        Line {finding.line_number}
                      </span>
                    )}
                  </div>
                  <SeverityBadge severity={finding.severity} />
                </div>

                <div className="finding-issue-text">
                  <p>{finding.issue}</p>
                </div>

                {finding.suggestion && (
                  <div className="finding-suggestion-box">
                    <div className="finding-suggestion-header">
                      <span className="finding-suggestion-title">
                        Suggested Resolution
                      </span>
                      <button
                        onClick={() => copyFix(finding.id, finding.suggestion!)}
                        className="btn btn-ghost"
                        style={{ height: 24, padding: "0 8px", fontSize: 10.5, gap: 4 }}
                        title="Copy suggested fix to clipboard"
                      >
                        {copiedFixId === finding.id ? (
                          <>
                            <Check size={12} style={{ color: "var(--green-success)" }} />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span>Copy Fix</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="finding-suggestion-code">
                      <code>{finding.suggestion}</code>
                    </pre>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Review Footer Metadata */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 11,
          color: "var(--text-muted)",
          padding: "0 4px",
        }}
      >
        <span>
          Internal Review Record ID: <strong>#{review.id}</strong>
        </span>
        <span>Synced with GitHub PR Webhook & PostgreSQL</span>
      </div>
    </div>
  );
}
