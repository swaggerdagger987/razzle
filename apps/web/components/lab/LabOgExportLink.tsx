/** In-panel link to download the Lab OG share card (matches Bureau export pattern). */
export function LabOgExportLink({
  slug,
  downloadName,
  label = "export card",
}: {
  slug: string;
  downloadName?: string;
  label?: string;
}) {
  const file = downloadName ?? `razzle-${slug}.png`;
  return (
    <a
      href={`/og/${slug}?download=1`}
      className="text-sm text-ink-medium underline"
      download={file}
    >
      {label}
    </a>
  );
}
