"use client";

import { useMemo } from "react";
import { LabOgExportLink, type OgSnapshotRow } from "../LabOgExportLink";

interface Props {
  data: unknown;
}

interface DashboardPlayer {
  full_name?: string;
  name?: string;
  position?: string;
  team?: string;
  rank_diff?: number;
  ppg?: number;
}

function playerName(p: DashboardPlayer): string {
  return p.full_name ?? p.name ?? "—";
}

function snapshotFromDashboard(obj: Record<string, unknown>): OgSnapshotRow[] {
  const risers = Array.isArray(obj.risers) ? (obj.risers as DashboardPlayer[]) : [];
  const fallers = Array.isArray(obj.fallers) ? (obj.fallers as DashboardPlayer[]) : [];
  const movers = [...risers, ...fallers];
  if (movers.length > 0) {
    return movers.slice(0, 6).map((p) => ({
      name: playerName(p),
      position: p.position ?? "",
      team: p.team ?? "",
      stat: p.rank_diff ?? 0,
      statLabel: "Chg",
    }));
  }
  const top5 = Array.isArray(obj.top5) ? (obj.top5 as DashboardPlayer[]) : [];
  return top5.slice(0, 6).map((p) => ({
    name: playerName(p),
    position: p.position ?? "",
    team: p.team ?? "",
    stat: p.ppg ?? 0,
    statLabel: "PPG",
  }));
}

export function DashboardRenderer({ data }: Props) {
  const obj = (data ?? {}) as Record<string, unknown>;
  const sections = ["risers", "fallers", "highlights", "summary", "cards", "items", "top5", "value_picks"]
    .map((k) => ({ key: k, value: obj[k] }))
    .filter((s) => s.value != null);

  const ogSnapshotRows = useMemo(() => snapshotFromDashboard(obj), [data]);
  const hasExportRows = ogSnapshotRows.length > 0;

  if (!sections.length && !hasExportRows) {
    return (
      <pre className="chunky overflow-auto bg-bg-card p-4 text-xs">{JSON.stringify(data, null, 2)}</pre>
    );
  }

  return (
    <div className="dashboard-panel">
      {sections.map(({ key, value }) => (
        <section key={key} className="dashboard-section chunky bg-bg-card p-4">
          <h3 style={{ fontFamily: "var(--font-display)" }}>{key}</h3>
          <pre className="text-xs">{JSON.stringify(value, null, 2)}</pre>
        </section>
      ))}
      {hasExportRows && (
        <footer className="mt-6 flex flex-wrap items-center gap-4 border-t border-ink pt-4">
          <LabOgExportLink
            slug="dashboard"
            downloadName="razzle-dashboard.png"
            snapshotRows={ogSnapshotRows}
          />
        </footer>
      )}
    </div>
  );
}
