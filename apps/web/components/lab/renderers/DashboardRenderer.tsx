"use client";

import { useMemo } from "react";
import { type OgSnapshotRow } from "../LabOgExportLink";
import { LabPanelShareBar } from "../LabPanelShareBar";

interface Props {
  data: unknown;
}

interface CompRow {
  full_name?: string;
  position?: string;
  team?: string;
  similarity?: number;
}

export function DashboardRenderer({ data }: Props) {
  const obj = (data ?? {}) as Record<string, unknown>;
  const comps = Array.isArray(obj.comps) ? (obj.comps as CompRow[]) : [];
  const hasComps = comps.length > 0;
  const scopedPlayerId = typeof obj.player_id === "string" ? obj.player_id : undefined;
  const sections = ["risers", "fallers", "highlights", "summary", "cards", "items"]
    .map((k) => ({ key: k, value: obj[k] }))
    .filter((s) => s.value != null);

  const ogSnapshotRows = useMemo((): OgSnapshotRow[] => {
    return comps.slice(0, 6).map((c) => ({
      name: c.full_name ?? "—",
      position: c.position ?? "",
      team: c.team ?? "",
      stat: Math.round((c.similarity ?? 0) * 100),
      statLabel: "Match %",
    }));
  }, [comps]);

  if (!sections.length && !hasComps) {
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
      {hasComps && !sections.length && (
        <pre className="chunky overflow-auto bg-bg-card p-4 text-xs">{JSON.stringify(obj, null, 2)}</pre>
      )}
      {hasComps && (
        <footer className="mt-6 flex flex-wrap items-center gap-4 border-t border-ink pt-4">
          <LabPanelShareBar
            slug="dynasty-comps"
            downloadName="razzle-dynasty-comps.png"
            playerId={scopedPlayerId}
            snapshotRows={ogSnapshotRows}
            copyLabel="copy dynasty comps link"
          />
        </footer>
      )}
    </div>
  );
}
