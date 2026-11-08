"use client";

import { useEffect, useState } from "react";
import { Activity, CircleCheck, CircleX, LoaderCircle } from "lucide-react";
import { getHealth, type HealthStatus } from "@/lib/api";

export function HealthIndicator() {
  const [status, setStatus] = useState<HealthStatus>("checking");
  useEffect(() => {
    let alive = true;
    const check = async () => {
      try {
        const health = await getHealth();
        if (alive) setStatus(health.status === "healthy" ? "connected" : "offline");
      } catch {
        if (alive) setStatus("offline");
      }
    };
    void check();
    const timer = window.setInterval(check, 30000);
    return () => { alive = false; window.clearInterval(timer); };
  }, []);
  const labels = { connected: "Backend connected", offline: "Backend unavailable", checking: "Checking backend" };
  const Icon = status === "connected" ? CircleCheck : status === "offline" ? CircleX : LoaderCircle;
  return <div className={`health ${status}`} title="Checks the backend /health endpoint"><span className="health-icon"><Icon size={14} className={status === "checking" ? "spin" : ""} /></span><span className="health-label">{labels[status]}</span><Activity size={13} className="health-activity" /></div>;
}
