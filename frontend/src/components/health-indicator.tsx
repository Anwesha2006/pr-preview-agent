"use client";

import { useEffect, useState } from "react";
import { Activity, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { getHealth, type HealthStatus } from "@/lib/api";

export function HealthIndicator() {
  const [status, setStatus] = useState<HealthStatus>("checking");
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    let alive = true;
    const check = async () => {
      try {
        const health = await getHealth();
        if (alive) {
          setStatus(health.status === "healthy" ? "connected" : "offline");
          setLastCheck(new Date());
        }
      } catch {
        if (alive) {
          setStatus("offline");
          setLastCheck(new Date());
        }
      }
    };

    void check();
    const timer = window.setInterval(check, 25000);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, []);

  const labels: Record<HealthStatus, string> = {
    connected: "Backend Connected",
    offline: "Backend Offline",
    checking: "Checking API",
  };

  const Icon =
    status === "connected"
      ? CheckCircle2
      : status === "offline"
      ? XCircle
      : Loader2;

  return (
    <div
      className={`health-pill ${status}`}
      title={
        lastCheck
          ? `Status: ${labels[status]} (Last checked: ${lastCheck.toLocaleTimeString()})`
          : "Checking backend connectivity"
      }
    >
      <Icon size={13} className={status === "checking" ? "spin" : ""} />
      <span>{labels[status]}</span>
      {status === "connected" && (
        <Activity size={12} style={{ opacity: 0.6, marginLeft: 2 }} />
      )}
    </div>
  );
}
