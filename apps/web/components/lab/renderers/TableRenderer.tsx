import { extractItems } from "@/lib/panel-api";

interface Props {
  data: unknown;
}

export function TableRenderer({ data }: Props) {
  const rows = extractItems(data);
  if (!rows.length) return <EmptyState />;

  const cols = Object.keys(rows[0]!);

  return (
    <div className="table-wrap chunky bg-bg-card">
      <table className="screener-table">
        <thead className="thead-shadow">
          <tr>
            {cols.map((c) => (
              <th key={c}>{c.replace(/_/g, " ")}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="screener-row">
              {cols.map((c) => (
                <td key={c}>{formatCell(row[c])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatCell(val: unknown) {
  if (val == null) return "—";
  if (typeof val === "number") return Number.isInteger(val) ? val : val.toFixed(1);
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

function EmptyState() {
  return (
    <p className="text-ink-medium p-6" style={{ fontFamily: "var(--font-hand)", fontSize: "1.25rem" }}>
      no data yet — check back after sync
    </p>
  );
}

export { EmptyState, formatCell };
