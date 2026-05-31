"use client";

import { LabPanelShareBar } from "./LabPanelShareBar";

/** Ja'Marr Chase gsis_id — matches DEFAULT_OG_PLAYER_ID in /og/[panel]/route.tsx */
export const DEFAULT_LAB_OG_PLAYER_ID = "00-0036900";

/** Panels whose OG route reads player_id from the export URL (see /og/[panel]/route.tsx). */
export const PLAYER_SCOPED_OG_SLUGS = [
  "dynasty-comps",
  "gamelog",
  "percentiles",
  "career",
  "career-compare",
  "strengths",
  "breakdown",
  "fptsbreakdown",
  "archetypes",
] as const;

/** In-panel link to download the Lab OG share card (matches Bureau export pattern). */

export interface OgSnapshotRow {
  name: string;
  position: string;
  team: string;
  stat: number;
  statLabel: string;
}

/** Compact base64url payload for OG route — mirrors rows visible in the Lab panel. */
export function encodeOgSnapshot(
  rows: OgSnapshotRow[],
  exportPlayerId?: string,
): string | undefined {
  const trimmed = rows.filter((r) => r.name).slice(0, 6);
  if (trimmed.length === 0) return undefined;
  const compact = trimmed.map((r) => ({
    n: r.name,
    p: r.position,
    t: r.team,
    s: r.stat,
    sl: r.statLabel,
  }));
  const pid = exportPlayerId?.trim();
  const payload = pid ? { r: compact, pid } : compact;
  const json = JSON.stringify(payload);
  if (typeof btoa === "function") {
    return btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  return undefined;
}

const LAUNCH10_COPY_LABELS: Record<string, string> = {
  efficiency: "copy efficiency link",
  aging: "copy aging link",
  prospects: "copy prospects link",
  tradevalues: "copy trade values link",
  dashboard: "copy dashboard link",
  "dynasty-comps": "copy dynasty comps link",
};

function resolveCopyLabel(slug: string, label?: string): string {
  if (label?.toLowerCase().includes("copy")) return label;
  return LAUNCH10_COPY_LABELS[slug] ?? `copy ${slug.replace(/-/g, " ")} link`;
}

/** @deprecated Prefer LabPanelShareBar in new footers; this wrapper keeps Launch-10 renderers on GTM share bar. */
export function LabOgExportLink({
  slug,
  downloadName,
  label,
  playerId,
  position,
  snapshotRows,
}: {
  slug: string;
  downloadName?: string;
  label?: string;
  /** When set, OG route uses this player for player-scoped panels (e.g. gamelog, dynasty-comps). */
  playerId?: string;
  /** Display name for hallway toLab watermark on exported cards. */
  playerName?: string;
  /** When set, OG route applies the same position filter as the in-product panel (e.g. rankings WR). */
  position?: string;
  /** Top rows from the in-product panel — OG card matches what the user sees. */
  snapshotRows?: OgSnapshotRow[];
}) {
  return (
    <LabPanelShareBar
      slug={slug}
      downloadName={downloadName}
      snapshotRows={snapshotRows}
      position={position}
      playerId={playerId}
      copyLabel={resolveCopyLabel(slug, label)}
    />
  );
}
