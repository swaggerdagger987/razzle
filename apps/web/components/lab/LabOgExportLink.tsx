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
  /** When set, OG route fetches/renders that player (gamelog, dynasty-comps). */
  playerId?: string;
}) {
  const file = downloadName ?? `razzle-${slug}.png`;
  const qs = new URLSearchParams({ download: "1" });
  if (playerId) qs.set("player_id", playerId);
  return (
    <a
      href={`/og/${slug}?${qs.toString()}`}
      className="text-sm text-ink-medium underline"
      download={file}
    >
      {label}
    </a>
  );
}
