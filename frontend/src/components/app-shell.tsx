"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Activity, ChevronLeft, ChevronRight, CircleHelp, GitBranch, GitPullRequest, LayoutDashboard, Menu, Settings2, ShieldCheck, Sparkles, X } from "lucide-react";
import { HealthIndicator } from "@/components/health-indicator";

const links = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Repositories", href: "/repositories", icon: GitBranch },
  { label: "Review history", href: "/reviews", icon: GitPullRequest },
  { label: "Analytics", href: "/analytics", icon: Activity },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  return <div className="app-frame">
    {mobileOpen && <button aria-label="Close navigation" className="mobile-scrim" onClick={() => setMobileOpen(false)} />}
    <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="brand-row"><Link href="/" className="brand"><span className="brand-mark"><ShieldCheck size={19} /></span><span className="brand-copy"><strong>Patchwork</strong><small>AI code review</small></span></Link><button className="icon-button collapse-button" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>{collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}</button><button className="icon-button mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={17} /></button></div>
      <div className="workspace"><div className="workspace-avatar">A</div><div className="workspace-copy"><strong>Acme workspace</strong><span>Personal plan</span></div><ChevronRight size={14} /></div>
      <div className="nav-group-label">WORKSPACE</div>
      <nav className="main-nav" aria-label="Main navigation">{links.map(({ label, href, icon: Icon }) => { const active = href === "/" ? pathname === "/" : pathname === href || (href === "/reviews" && pathname.startsWith("/reviews/")); return <Link key={href} href={href} aria-current={active ? "page" : undefined} title={collapsed ? label : undefined} onClick={() => setMobileOpen(false)} className={`nav-link ${active ? "active" : ""}`}><Icon size={17} strokeWidth={1.8} /><span>{label}</span>{active && <span className="nav-active-dot" />}</Link>; })}</nav>
      <div className="nav-group-label nav-group-spaced">PREFERENCES</div>
      <nav className="main-nav" aria-label="Preferences"><Link href="/settings" aria-current={pathname === "/settings" ? "page" : undefined} title={collapsed ? "Settings" : undefined} onClick={() => setMobileOpen(false)} className={`nav-link ${pathname === "/settings" ? "active" : ""}`}><Settings2 size={17} strokeWidth={1.8} /><span>Settings</span></Link></nav>
      <div className="sidebar-bottom"><div className="sidebar-promo"><div className="promo-icon"><Sparkles size={15} /></div><strong>Review with confidence</strong><p>Your AI reviewer checks every change for issues before they reach production.</p><Link href="/reviews">Explore reviews <ChevronRight size={13} /></Link></div><div className="account-row"><div className="avatar">W</div><div className="account-copy"><strong>Workspace profile</strong><span>Sign-in not configured</span></div><CircleHelp size={16} className="help-icon" /></div></div>
    </aside>
    <div className="main-area"><header className="topbar"><div className="topbar-left"><button className="icon-button mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={19} /></button><div className="crumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>{pathname === "/" ? "Overview" : pathname.split("/")[1] === "reviews" ? pathname.split("/")[2] ? "Review details" : "Review history" : pathname.split("/")[1]?.[0].toUpperCase() + pathname.split("/")[1]?.slice(1)}</strong></div></div><div className="topbar-right"><span className="topbar-env"><i /> Development</span><HealthIndicator /><div className="topbar-avatar">W</div></div></header><main className="content">{children}</main><footer className="footer"><span>Patchwork <b>·</b> AI PR review agent</span><span>Built for safer code, shipped faster.</span></footer></div>
  </div>;
}
