import { extractItems } from "@/lib/panel-api";
import { formatCell } from "./TableRenderer";

interface Props {
  data: unknown;
}

export function ScatterRenderer({ data }: Props) {
  const rows = extractItems(data);
  if (!rows.length) return <p className="text-ink-medium p-6">no scatter data yet</p>;

  const xKey = Object.keys(rows[0]!).find((k) => k.includes("floor") || k.includes("x")) ?? "x";
  const yKey = Object.keys(rows[0]!).find((k) => k.includes("ceiling") || k.includes("y")) ?? "y";

  return (
    <div className="scatter-panel chunky bg-bg-card p-6">
      <div className="scatter-plot">
        {rows.slice(0, 40).map((row, i) => {
          const x = Number(row[xKey] ?? row.fantasy_points_ppr ?? i);
          const y = Number(row[yKey] ?? row.games ?? i);
          return (
            <div
              key={i}
              className="scatter-dot"
              style={{ left: `${Math.min(95, (x / 30) * 100)}%`, bottom: `${Math.min(95, (y / 17) * 100)}%` }}
              title={`${row.full_name ?? i}: ${formatCell(x)} / ${formatCell(y)}`}
            />
          );
        })}
      </div>
      <TableRendererLite rows={rows.slice(0, 10)} />
    </div>
  );
}

function TableRendererLite({ rows }: { rows: Array<Record<string, unknown>> }) {
  const cols = Object.keys(rows[0] ?? {}).slice(0, 5);
  return (
    <table className="screener-table mt-4">
      <thead>
        <tr>
          {cols.map((c) => (
            <th key={c}>{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {cols.map((c) => (
              <td key={c}>{formatCell(row[c])}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
