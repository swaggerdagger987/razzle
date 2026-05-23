"use client";

import { useEffect, useState } from "react";

type Plan = "free" | "pro" | "elite";

interface DevStatus {
  plan: Plan;
  llm_configured: boolean;
  database: { exists?: boolean; players?: number; path?: string };
  hints?: Record<string, string>;
}

export function DevToolbar() {
  const [status, setStatus] = useState<DevStatus | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/dev/status")
      .then((r) => (r.ok ? r.json() : null))
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);

  if (!status) return null;

  async function setPlan(plan: Plan) {
    setBusy(true);
    try {
      const r = await fetch("/api/dev/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const j = await r.json();
      setStatus((s) => (s ? { ...s, plan: j.plan } : s));
    } finally {
      setBusy(false);
    }
  }

  const dbOk = status.database?.exists && (status.database.players ?? 0) > 0;

  return (
    <div className="dev-toolbar">
      <span className="dev-toolbar-label">DEV</span>
      <span className={`dev-toolbar-chip ${dbOk ? "ok" : "warn"}`}>
        DB: {dbOk ? `${status.database.players} players` : "empty — run sync_data.py"}
      </span>
      <span className={`dev-toolbar-chip ${status.llm_configured ? "ok" : "warn"}`}>
        LLM: {status.llm_configured ? "on" : "off"}
      </span>
      <span className="dev-toolbar-chip">Plan: {status.plan}</span>
      {(["free", "pro", "elite"] as Plan[]).map((p) => (
        <button
          key={p}
          type="button"
          disabled={busy || status.plan === p}
          className={`dev-toolbar-btn${status.plan === p ? " active" : ""}`}
          onClick={() => void setPlan(p)}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
