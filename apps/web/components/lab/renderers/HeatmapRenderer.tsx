import { extractItems } from "@/lib/panel-api";

interface Props {
  data: unknown;
}

export function HeatmapRenderer({ data }: Props) {
  const rows = extractItems(data);
  if (!rows.length) return <p className="text-ink-medium p-6">pulling film...</p>;

  const cols = Object.keys(rows[0]!).filter((k) => typeof rows[0]![k] === "number");

  return (
    <div className="heatmap-grid chunky bg-bg-card p-4">
      <table className="screener-table">
        <thead>
          <tr>
            <th>Player</th>
            {cols.map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td>{String(row.full_name ?? row.name ?? i + 1)}</td>
              {cols.map((c) => {
                const val = Number(row[c] ?? 0);
                const intensity = Math.min(1, val / 30);
                return (
                  <td
                    key={c}
                    style={{
                      background: `color-mix(in srgb, var(--orange) ${Math.round(intensity * 100)}%, var(--bg-card))`,
                    }}
                  >
                    {val.toFixed(1)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
