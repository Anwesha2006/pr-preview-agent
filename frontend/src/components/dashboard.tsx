"use client";

import { OverviewDashboard } from "@/components/overview-dashboard";
import { RepositoriesView } from "@/components/repositories-view";
import { ReviewHistory } from "@/components/review-history";
import { ReviewDetailsView } from "@/components/review-details-view";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { SettingsView } from "@/components/settings-view";

// Maintain full backward-compatibility with existing page imports
export function OverviewPage() {
  return <OverviewDashboard />;
}

export function RepositoriesPage() {
  return <RepositoriesView />;
}

export function ReviewsPage() {
  return <ReviewHistory />;
}

export function ReviewDetailsPage({ id }: { id: string }) {
  return <ReviewDetailsView id={id} />;
}

export function AnalyticsPage() {
  return <AnalyticsDashboard />;
}

export function SettingsPage() {
  return <SettingsView />;
}

export function NotFoundReview({ id }: { id: string }) {
  return <ReviewDetailsView id={id} />;
}

export {
  OverviewDashboard,
  RepositoriesView,
  ReviewHistory,
  ReviewDetailsView,
  AnalyticsDashboard,
  SettingsView,
};
