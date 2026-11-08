import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Patchwork — AI PR Review Agent",
  description: "A clear view of your AI-powered GitHub pull request reviews.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><Suspense fallback={<div style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "#8994a2", fontSize: 12 }}>Loading workspace…</div>}><AppShell>{children}</AppShell></Suspense></body></html>;
}
