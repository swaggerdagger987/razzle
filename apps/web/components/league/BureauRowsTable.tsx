"use client";

import { formatColumnLabel } from "@/lib/column-labels";

interface Props {
  rows: Array<Record<string, unknown>>;
  title?: string;
  emptyMessage?: string;
}

export function BureauRowsTable({ rows, title, emptyMessage }: Props) {
  if (!rows.length) {
    return <p className="text-ink-medium">{emptyMessage ?? "no data yet — check back after the first week."}</p>;
  }
  const cols = Object.keys(rows[0] ?? {});
  return (
    <div className="flex flex-col gap-4">
      {title && (
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          {title}
        </h1>
      )}
      <div className="table-wrap chunky bg-bg-card">
        <table className="screener-table">
          <thead className="thead-shadow">
            <tr>
              {cols.map((c) => (
                <th key={c}>{formatColumnLabel(c)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="screener-row">
                {cols.map((c) => (
                  <td key={c}>{String(row[c] ?? "")}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
