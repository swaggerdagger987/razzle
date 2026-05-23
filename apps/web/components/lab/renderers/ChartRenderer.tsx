import { extractItems } from "@/lib/panel-api";
import { formatCell } from "./TableRenderer";

interface Props {
  data: unknown;
  type: "bar-chart" | "line-chart" | "timeline";
}

export function ChartRenderer({ data, type }: Props) {
  const rows = extractItems(data);
  if (!rows.length) return <p className="text-ink-medium p-6">no chart data yet</p>;

  const numericKey = Object.keys(rows[0]!).find((k) => typeof rows[0]![k] === "number") ?? "value";
  const labelKey = Object.keys(rows[0]!).find((k) => typeof rows[0]![k] === "string") ?? "label";
  const max = Math.max(...rows.map((r) => Number(r[numericKey] ?? 0)), 1);

  return (
    <div className="chart-panel chunky bg-bg-card p-6">
      <p className="text-ink-light mb-4 text-xs uppercase">{type.replace("-", " ")}</p>
      <div className={`chart-bars chart-${type}`}>
        {rows.slice(0, 20).map((row, i) => {
          const val = Number(row[numericKey] ?? 0);
          const pct = (val / max) * 100;
          return (
            <div key={i} className="chart-bar-row">
              <span className="chart-bar-label">{formatCell(row[labelKey])}</span>
              <div className="chart-bar-track">
                <div className="chart-bar-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="chart-bar-value">{formatCell(val)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
