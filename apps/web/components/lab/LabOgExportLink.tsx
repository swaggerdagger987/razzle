/** Ja'Marr Chase gsis_id — matches DEFAULT_OG_PLAYER_ID in /og/[panel]/route.tsx */
export const DEFAULT_LAB_OG_PLAYER_ID = "00-0036900";

/** In-panel link to download the Lab OG share card (matches Bureau export pattern). */
export function LabOgExportLink({
  slug,
  downloadName,
  label = "export card",
  playerId,
  position,
}: {
  slug: string;
  downloadName?: string;
  label?: string;
  /** When set, OG route uses this player for player-scoped panels (e.g. gamelog, dynasty-comps). */
  playerId?: string;
  /** When set, OG route applies the same position filter as the in-product panel (e.g. rankings WR). */
  position?: string;
}) {
  const file = downloadName ?? `razzle-${slug}.png`;
  const params = new URLSearchParams({ download: "1" });
  if (playerId) params.set("player_id", playerId);
  if (position) params.set("position", position);
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
