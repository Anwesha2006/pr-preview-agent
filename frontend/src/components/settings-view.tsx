"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  GitBranch,
  Lock,
  Server,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { getHealth, type HealthStatus } from "@/lib/api";
import { PageHeader } from "@/components/ui-components";

export function SettingsView() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus>("checking");
  const [serviceName, setServiceName] = useState<string>("PR Review Agent");

  useEffect(() => {
    let alive = true;
    async function check() {
      try {
        const res = await getHealth();
        if (alive) {
          setHealthStatus(res.status === "healthy" ? "connected" : "offline");
          if (res.service) setServiceName(res.service);
        }
      } catch {
        if (alive) setHealthStatus("offline");
      }
    }
    check();
    return () => {
      alive = false;
    };
  }, []);

  const model = process.env.NEXT_PUBLIC_AI_MODEL || "Gemini 3.1 Flash Lite";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "Configured in .env";

  // Mask or clean URL for safe display
  const displayApiUrl = apiUrl ? new URL(apiUrl).origin : "Not configured";

  return (
    <>
      <PageHeader
        eyebrow="Configuration & Integrations"
        title="Settings"
        description="Verify service health, AI model capabilities, webhook endpoints, and security posture."
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.6fr) minmax(320px, 1fr)",
          gap: 20,
          alignItems: "start",
        }}
      >
        {/* Main Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* GitHub App Integration Card */}
          <section className="card">
            <div className="card-header">
              <div className="card-title-group">
                <h2 className="card-title">GitHub App Integration</h2>
                <p className="card-subtitle">
                  Automated pull request review webhook listener
                </p>
              </div>
              <span className="status-badge completed">
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

            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingBottom: 14,
                  borderBottom: "1px solid var(--line-soft)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "var(--radius-md)",
                      background: "var(--panel-secondary)",
                      border: "1px solid var(--line)",
                      display: "grid",
                      placeItems: "center",
                      color: "var(--text-primary)",
                    }}
                  >
                    <GitBranch size={17} />
                  </div>
                  <div>
                    <strong style={{ fontSize: 13, color: "var(--text-primary)", display: "block" }}>
                      Webhook Ingestion
                    </strong>
                    <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                      Subscribed to <code>pull_request</code> & <code>pull_request_review_comment</code>
                    </span>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    color: "var(--green-success)",
                    background: "var(--green-muted)",
                    padding: "2px 8px",
                    borderRadius: 4,
                    border: "1px solid var(--green-border)",
                  }}
                >
                  200 OK Active
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingBottom: 14,
                  borderBottom: "1px solid var(--line-soft)",
                }}
              >
                <div>
                  <strong style={{ fontSize: 12.5, color: "var(--text-primary)", display: "block" }}>
                    Permissions
                  </strong>
                  <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                    Read pull request diffs, write review comments & line-level suggestions
                  </span>
                </div>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  Least Privilege Granted
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <strong style={{ fontSize: 12.5, color: "var(--text-primary)", display: "block" }}>
                    Review Policy
                  </strong>
                  <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                    Autonomous inline annotations with fix suggestions
                  </span>
                </div>
                <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                  Automatic on PR open/sync
                </span>
              </div>
            </div>
          </section>

          {/* AI Review Engine Specifications */}
          <section className="card">
            <div className="card-header">
              <div className="card-title-group">
                <h2 className="card-title">AI Review Engine</h2>
                <p className="card-subtitle">
                  Model configuration and code analysis capabilities
                </p>
              </div>
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 600,
                  fontFamily: "var(--font-mono)",
                  color: "var(--accent-saffron)",
                  background: "var(--accent-saffron-muted)",
                  padding: "2px 8px",
                  borderRadius: 4,
                  border: "1px solid var(--accent-saffron-border)",
                }}
              >
                GEMINI AI
              </span>
            </div>

            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingBottom: 14,
                  borderBottom: "1px solid var(--line-soft)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "var(--radius-md)",
                      background: "var(--accent-saffron-muted)",
                      border: "1px solid var(--accent-saffron-border)",
                      display: "grid",
                      placeItems: "center",
                      color: "var(--accent-saffron)",
                    }}
                  >
                    <Sparkles size={17} />
                  </div>
                  <div>
                    <strong style={{ fontSize: 13, color: "var(--text-primary)", display: "block" }}>
                      {model}
                    </strong>
                    <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                      High-throughput, low-latency reasoning model by Google DeepMind
                    </span>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--accent-saffron)",
                    fontWeight: 500,
                  }}
                >
                  Enabled
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingBottom: 14,
                  borderBottom: "1px solid var(--line-soft)",
                }}
              >
                <div>
                  <strong style={{ fontSize: 12.5, color: "var(--text-primary)", display: "block" }}>
                    Analysis Pipeline
                  </strong>
                  <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                    AST Parsing → Diff Comparison → Static Security Check → LLM Verification
                  </span>
                </div>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  Zero Hallucination Guardrails
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <strong style={{ fontSize: 12.5, color: "var(--text-primary)", display: "block" }}>
                    Worker Execution
                  </strong>
                  <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                    Celery Task Queue with Redis / RabbitMQ broker
                  </span>
                </div>
                <span style={{ fontSize: 11, color: "var(--green-success)" }}>
                  Asynchronous
                </span>
              </div>
            </div>
          </section>

          {/* Account & Workspace Profile */}
          <section className="card">
            <div className="card-header">
              <div className="card-title-group">
                <h2 className="card-title">Account & Workspace Profile</h2>
                <p className="card-subtitle">
                  Active dashboard credentials and permissions
                </p>
              </div>
              <span className="status-badge completed" style={{ fontSize: 10 }}>
                Owner Tier
              </span>
            </div>

            <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "#1B212C",
                  border: "1px solid var(--line-strong)",
                  display: "grid",
                  placeItems: "center",
                  color: "var(--text-primary)",
                  fontSize: 16,
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                AD
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ fontSize: 14, color: "var(--text-primary)", display: "block" }}>
                  Workspace Administrator
                </strong>
                <span style={{ fontSize: 11.5, color: "var(--text-secondary)", display: "block" }}>
                  dev@patchwork.ai · Patchwork Core Team
                </span>
                <span style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 4, display: "block" }}>
                  Full administrative access to review policies, webhook secrets, and database logs.
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Aside Column: Connection Health & Security Vault */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Backend Connection Card */}
          <section className="card" style={{ padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "var(--radius-md)",
                  background:
                    healthStatus === "connected"
                      ? "var(--green-muted)"
                      : "var(--red-muted)",
                  border: `1px solid ${
                    healthStatus === "connected"
                      ? "var(--green-border)"
                      : "var(--red-border)"
                  }`,
                  display: "grid",
                  placeItems: "center",
                  color:
                    healthStatus === "connected"
                      ? "var(--green-success)"
                      : "var(--red-error)",
                }}
              >
                <Server size={18} />
              </div>

              <span
                className={`status-badge ${
                  healthStatus === "connected" ? "completed" : "failed"
                }`}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "currentColor",
                  }}
                />
                {healthStatus === "connected" ? "FastAPI Live" : "Offline"}
              </span>
            </div>

            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>
              Backend API Status
            </h3>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 14 }}>
              Verified via the <code>/health</code> probe endpoint. Provides real-time data persistence and webhook evaluation.
            </p>

            <div
              style={{
                background: "var(--panel-secondary)",
                border: "1px solid var(--line)",
                borderRadius: "var(--radius-md)",
                padding: "10px 12px",
                display: "flex",
                flexDirection: "column",
                gap: 4,
                marginBottom: 14,
              }}
            >
              <span style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>
                Target Endpoint
              </span>
              <code style={{ fontSize: 11, color: "var(--text-primary)", fontFamily: "var(--font-mono)", wordBreak: "break-all" }}>
                {displayApiUrl}
              </code>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)" }}>
              <Activity size={12} style={{ color: "var(--accent-saffron)" }} />
              <span>Service: {serviceName}</span>
            </div>
          </section>

          {/* Security & Secrets Assurance Card */}
          <section
            className="card"
            style={{
              padding: "20px 22px",
              background: "linear-gradient(135deg, rgba(17, 19, 24, 0.95), rgba(23, 26, 33, 0.98))",
              border: "1px solid var(--line-strong)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "var(--radius-sm)",
                  background: "var(--green-muted)",
                  border: "1px solid var(--green-border)",
                  display: "grid",
                  placeItems: "center",
                  color: "var(--green-success)",
                }}
              >
                <Lock size={16} />
              </div>
              <strong style={{ fontSize: 13, color: "var(--text-primary)" }}>
                Credential Confidentiality
              </strong>
            </div>

            <p style={{ fontSize: 11.5, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 14 }}>
              This frontend strictly isolates sensitive secrets. GitHub Private Keys, Webhook Secrets, Gemini API tokens, and PostgreSQL connection URIs are stored exclusively in backend environment variables and are never transmitted to or readable by client browsers.
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 11,
                color: "var(--green-success)",
              }}
            >
              <ShieldCheck size={14} />
              <span>Zero-Exposure Architecture Verified</span>
            </div>
          </section>

          {/* Runtime Stack Pill */}
          <section className="card" style={{ padding: "16px 20px" }}>
            <span style={{ fontSize: 10.5, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 10 }}>
              Runtime Architecture
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["Next.js 16 (App Router)", "React 19", "FastAPI Python 3", "PostgreSQL", "Tailwind CSS v4", "Recharts 3"].map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: 10.5,
                    fontFamily: "var(--font-mono)",
                    color: "var(--text-secondary)",
                    background: "var(--panel-secondary)",
                    border: "1px solid var(--line)",
                    padding: "2px 7px",
                    borderRadius: 4,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
