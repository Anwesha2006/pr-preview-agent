import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Patchwork — Premium AI PR Review Dashboard",
  description:
    "Production-grade developer dashboard for autonomous AI pull request reviews, defect detection, and continuous code quality audits.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Suspense
          fallback={
            <div
              style={{
                minHeight: "100vh",
                background: "#0A0A0A",
                display: "grid",
                placeItems: "center",
                color: "#9299A6",
                fontSize: 13,
                fontFamily:
                  '"Inter", "Geist Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    border: "2px solid #F5840C",
                    borderTopColor: "transparent",
                    animation: "spin 1s linear infinite",
                  }}
                />
                <span>Initializing Patchwork workspace...</span>
              </div>
            </div>
          }
        >
          <AppShell>{children}</AppShell>
        </Suspense>
      </body>
    </html>
  );
}
