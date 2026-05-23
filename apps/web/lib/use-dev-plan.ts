"use client";

import { useEffect, useState } from "react";

export type DevPlan = "free" | "pro" | "elite";

export function useDevPlan(): DevPlan | null {
  const [plan, setPlan] = useState<DevPlan | null>(null);

  useEffect(() => {
    fetch("/api/dev/status")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setPlan(j?.plan ?? "free"))
      .catch(() => setPlan("free"));
  }, []);

  return plan;
}
