"use client";

import { useQuery } from "@tanstack/react-query";
import type { PanelDef } from "../registry";

function rankColor(rank: number, max: number): string {
  const t = (max - rank) / (max - 1);
  return `color-mix(in srgb, var(--green) ${Math.round(t * 70)}%, var(--red) ${Math.round((1 - t) * 50)}%)`;
}

export default function Matchups({ panel }: { panel: PanelDef }) {
  const q = useQuery({
    queryKey: ["matchups"],
    queryFn: async () => {
      const r = await fetch("/api/matchup-heatmap");
      if (!r.ok) throw new Error(`API ${r.status}`);
      return (await r.json()) as {
        teams: string[];
        rows: Array<{ position: string; cells: Array<{ team: string; rank: number }> }>;
      };
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          {panel.title}
        </h1>
        <p className="text-sm text-ink-medium">{panel.blurb}</p>
      </header>

      {q.isPending && <p className="text-ink-medium">pulling film...</p>}
      {q.isError && <p className="text-red">something fumbled: {(q.error as Error).message}</p>}
      {q.isSuccess && (
        <div className="chunky overflow-auto bg-bg-card">
          <table className="w-full text-xs">
            <thead className="border-b-[3px] border-ink">
              <tr>
                <th className="px-3 py-2 text-left">Pos</th>
                {q.data.teams.map((t) => (
                  <th key={t} className="px-2 py-2 text-center font-bold">
                    {t}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {q.data.rows.map((row) => (
                <tr key={row.position} className="border-b border-ink-faint">
                  <td className="px-3 py-2 font-bold">vs {row.position}</td>
                  {row.cells.map((c) => (
                    <td
                      key={c.team}
                      className="px-2 py-2 text-center text-white"
                      style={{ background: rankColor(c.rank, q.data.teams.length) }}
                    >
                      {c.rank}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
