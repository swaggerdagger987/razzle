/** In-panel link to download the Lab OG share card (matches Bureau export pattern). */

export interface OgSnapshotRow {
  name: string;
  position: string;
  team: string;
  stat: number;
  statLabel: string;
}

/** Compact base64url payload for OG route — mirrors rows visible in the Lab panel. */
export function encodeOgSnapshot(rows: OgSnapshotRow[]): string | undefined {
  const trimmed = rows.filter((r) => r.name).slice(0, 6);
  if (trimmed.length === 0) return undefined;
  const compact = trimmed.map((r) => ({
    n: r.name,
    p: r.position,
    t: r.team,
    s: r.stat,
    sl: r.statLabel,
  }));
  const json = JSON.stringify(compact);
  if (typeof btoa === "function") {
    return btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  return undefined;
}

export function LabOgExportLink({
  slug,
  downloadName,
  label = "export card",
  playerId,
  snapshotRows,
}: {
  slug: string;
  downloadName?: string;
  label?: string;
  /** When set, OG route uses this player for player-scoped panels (e.g. gamelog, dynasty-comps). */
  playerId?: string;
  /** Top rows from the in-product panel — OG card matches what the user sees. */
  snapshotRows?: OgSnapshotRow[];
}) {
  const file = downloadName ?? `razzle-${slug}.png`;
  const params = new URLSearchParams({ download: "1" });
  if (playerId) params.set("player_id", playerId);
  const snapshot = snapshotRows?.length ? encodeOgSnapshot(snapshotRows) : undefined;
  if (snapshot) params.set("snapshot", snapshot);
  return (
    <a
      href={`/og/${slug}?${params.toString()}`}
      className="text-sm text-ink-medium underline"
      download={file}
    >
      {label}
    </a>
  );
}
