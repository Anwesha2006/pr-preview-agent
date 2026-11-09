"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  GitPullRequest,
  LayoutDashboard,
  Menu,
  Settings,
  ShieldCheck,
  Sparkles,
  X,
  ChevronDown,
} from "lucide-react";
import { HealthIndicator } from "@/components/health-indicator";

interface NavLinkItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: string;
}

const mainNavLinks: NavLinkItem[] = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Repositories", href: "/repositories", icon: GitBranch },
  { label: "Review History", href: "/reviews", icon: GitPullRequest },
  { label: "Analytics", href: "/analytics", icon: Activity },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isReviewsSubpage = pathname.startsWith("/reviews/") && pathname !== "/reviews";
  const reviewId = isReviewsSubpage ? pathname.split("/")[2] : null;

  // Determine environment
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
  const isProd = apiUrl.includes("render.com") || process.env.NODE_ENV === "production";

  return (
    <div className="app-frame">
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          className="mobile-scrim"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar ${collapsed ? "collapsed" : ""} ${
          mobileOpen ? "mobile-open" : ""
        }`}
      >
        {/* Brand header */}
        <div className="brand-row">
          <Link href="/" className="brand" onClick={() => setMobileOpen(false)}>
            <div className="brand-mark">
              <ShieldCheck size={18} strokeWidth={2.2} />
            </div>
            <div className="brand-copy">
              <strong>Patchwork</strong>
              <small>AI PR Review Agent</small>
            </div>
          </Link>

          <button
            className="icon-button collapse-button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>

          <button
            className="icon-button mobile-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X size={16} />
          </button>
        </div>

        {/* Workspace selector */}
        <div
          className="workspace-selector"
          title="Active Workspace: Patchwork Core"
        >
          <div className="workspace-avatar">PW</div>
          <div className="workspace-info">
            <strong>Patchwork Core</strong>
            <span>Active Agent</span>
          </div>
          <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />
        </div>

        {/* Navigation - Main */}
        <div className="nav-section-label">WORKSPACE</div>
        <nav className="nav-group" aria-label="Main Navigation">
          {mainNavLinks.map(({ label, href, icon: Icon, badge }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : pathname === href || (href === "/reviews" && pathname.startsWith("/reviews/"));

            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                title={collapsed ? label : undefined}
                onClick={() => setMobileOpen(false)}
                className={`nav-item ${active ? "active" : ""}`}
              >
                <Icon size={16} strokeWidth={1.9} />
                <span>{label}</span>
                {badge && <span className="nav-badge">{badge}</span>}
                {active && <span className="nav-active-pill" />}
              </Link>
            );
          })}
        </nav>

        {/* Navigation - Preferences */}
        <div className="nav-section-label" style={{ marginTop: 20 }}>
          PREFERENCES
        </div>
        <nav className="nav-group" aria-label="Preferences Navigation">
          <Link
            href="/settings"
            aria-current={pathname === "/settings" ? "page" : undefined}
            title={collapsed ? "Settings" : undefined}
            onClick={() => setMobileOpen(false)}
            className={`nav-item ${pathname === "/settings" ? "active" : ""}`}
          >
            <Settings size={16} strokeWidth={1.9} />
            <span>Settings</span>
            {pathname === "/settings" && <span className="nav-active-pill" />}
          </Link>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          {/* AI Engine Status Card */}
          <div className="sidebar-status-card">
            <div className="sidebar-status-header">
              <span className="sidebar-status-title">
                <Sparkles size={13} />
                Gemini 3.1 Flash Lite
              </span>
              <span className="status-badge completed" style={{ fontSize: 9, padding: "1px 6px" }}>
                Active
              </span>
            </div>
            <p className="sidebar-status-desc">
              Automatic AST & diff inspection on incoming GitHub webhooks.
            </p>
          </div>

          {/* User Profile */}
          <div className="sidebar-profile">
            <div className="profile-avatar">AD</div>
            <div className="profile-details">
              <strong>Workspace Admin</strong>
              <span>dev@patchwork.ai</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-area">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={18} />
            </button>

            {/* Breadcrumb Navigation */}
            <div className="breadcrumbs">
              <Link href="/">Workspace</Link>
              <span className="breadcrumb-sep">/</span>
              {pathname === "/" ? (
                <span className="breadcrumb-current">Overview</span>
              ) : isReviewsSubpage ? (
                <>
                  <Link href="/reviews">Review History</Link>
                  <span className="breadcrumb-sep">/</span>
                  <span className="breadcrumb-current">Review #{reviewId}</span>
                </>
              ) : pathname === "/reviews" ? (
                <span className="breadcrumb-current">Review History</span>
              ) : pathname === "/repositories" ? (
                <span className="breadcrumb-current">Repositories</span>
              ) : pathname === "/analytics" ? (
                <span className="breadcrumb-current">Analytics</span>
              ) : pathname === "/settings" ? (
                <span className="breadcrumb-current">Settings</span>
              ) : (
                <span className="breadcrumb-current">
                  {pathname.replace("/", "")}
                </span>
              )}
            </div>
          </div>

          <div className="topbar-right">
            <div className="topbar-env-pill">
              <span className="env-dot" />
              <span>{isProd ? "Cloud Production" : "Local Environment"}</span>
            </div>

            <HealthIndicator />

            <div
              className="profile-avatar"
              style={{ width: 30, height: 30, fontSize: 11, cursor: "pointer" }}
              title="Workspace Admin"
            >
              AD
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="content">{children}</main>

        {/* Footer */}
        <footer className="app-footer">
          <span>
            <strong>Patchwork</strong> · AI Pull Request Review Agent
          </span>
          <span>Engineered for safer code & accelerated shipping</span>
        </footer>
      </div>
    </div>
  );
}
