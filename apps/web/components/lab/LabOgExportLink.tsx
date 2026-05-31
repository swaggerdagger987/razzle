/** Ja'Marr Chase gsis_id — matches DEFAULT_OG_PLAYER_ID in /og/[panel]/route.tsx */
export const DEFAULT_LAB_OG_PLAYER_ID = "00-0036900";

/** In-panel link to download the Lab OG share card (matches Bureau export pattern). */
export function LabOgExportLink({
  slug,
  downloadName,
  label = "export card",
  playerId,
}: {
  slug: string;
  downloadName?: string;
  label?: string;
  /** When set, OG route renders that player's panel rows (player-scoped panels). */
  playerId?: string;
}) {
  const file = downloadName ?? `razzle-${slug}.png`;
  const params = new URLSearchParams({ download: "1" });
  if (playerId) params.set("player_id", playerId);
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
