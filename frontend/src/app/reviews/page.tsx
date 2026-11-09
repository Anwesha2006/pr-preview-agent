import { Suspense } from "react";
import { ReviewsPage } from "@/components/dashboard";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "32px 0", color: "var(--text-secondary)" }}>
          Loading review history...
        </div>
      }
    >
      <ReviewsPage />
    </Suspense>
  );
}
