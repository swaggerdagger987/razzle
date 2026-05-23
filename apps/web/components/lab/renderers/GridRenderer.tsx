import { extractItems } from "@/lib/panel-api";

interface Props {
  data: unknown;
}

export function GridRenderer({ data }: Props) {
  const rows = extractItems(data);
  if (!rows.length) return <p className="text-ink-medium p-6">no grid data yet</p>;

  return (
    <div className="panel-grid">
      {rows.map((row, i) => (
        <div key={i} className="panel-grid-cell chunky bg-bg-card p-3">
          <div className="font-bold">{String(row.label ?? row.week ?? row.position ?? `#${i + 1}`)}</div>
          <div className="text-ink-medium text-sm">{String(row.value ?? row.player ?? row.full_name ?? "")}</div>
        </div>
      ))}
    </div>
  );
}
