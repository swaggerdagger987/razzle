import { extractItems } from "@/lib/panel-api";
import { formatCell } from "./TableRenderer";

interface Props {
  data: unknown;
}

export function DonutRenderer({ data }: Props) {
  const obj = data as Record<string, unknown>;
  const slices =
    (Array.isArray(obj.slices) ? obj.slices : null) ??
    extractItems(data).map((row) => ({
      label: row.label ?? row.category ?? row.full_name,
      value: row.value ?? row.share ?? row.pct,
    }));

  if (!slices.length) return <p className="text-ink-medium p-6">no breakdown yet</p>;

  const total = slices.reduce((sum: number, s: Record<string, unknown>) => sum + Number(s.value ?? 0), 0) || 1;

  return (
    <div className="donut-panel chunky bg-bg-card p-6">
      <div className="donut-legend">
        {slices.map((slice: Record<string, unknown>, i: number) => {
          const pct = (Number(slice.value ?? 0) / total) * 100;
          return (
            <div key={i} className="donut-slice-row">
              <span className="donut-swatch" style={{ background: `var(--pos-${["qb", "rb", "wr", "te"][i % 4]})` }} />
              <span>{formatCell(slice.label)}</span>
              <span className="donut-pct">{pct.toFixed(1)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
