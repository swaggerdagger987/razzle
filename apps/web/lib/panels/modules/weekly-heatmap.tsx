"use client";

import { useQuery } from "@tanstack/react-query";
import { POSITION_COLOR } from "@razzle/ui";
import type { Position } from "@razzle/types";
import type { PanelDef } from "../registry";

// Color a cell on a 0..1 scale (low = bg-card, high = green).
function cellColor(value: number): string {
  if (value <= 0) return "var(--bg-card)";
  const intensity = Math.min(1, value);
  return `color-mix(in srgb, var(--green) ${Math.round(intensity * 70)}%, var(--bg-card))`;
}

export default function WeeklyHeatmap({ panel }: { panel: PanelDef }) {
  const q = useQuery({
    queryKey: ["weekly-heatmap"],
    queryFn: async () => {
      const r = await fetch("/api/weekly-heatmap");
      if (!r.ok) throw new Error(`API ${r.status}`);
      return (await r.json()) as {
        weeks: number[];
        players: Array<{
          full_name: string;
          position: Position;
          team: string;
          cells: Array<{ week: number; value: number; raw: number }>;
        }>;
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
          <table className="w-max text-xs">
            <thead className="border-b-[3px] border-ink">
              <tr>
                <th className="sticky left-0 z-10 bg-bg-card px-3 py-2 text-left">Player</th>
                {q.data.weeks.map((w) => (
                  <th key={w} className="px-2 py-2 text-center">
                    W{w}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {q.data.players.map((p) => (
                <tr key={p.full_name} className="border-b border-ink-faint">
                  <td className="sticky left-0 z-10 bg-bg-card px-3 py-1 font-bold">
                    <span
                      className="mr-2 rounded px-1.5 py-0.5 text-[10px] text-white"
                      style={{ background: POSITION_COLOR[p.position] }}
                    >
                      {p.position}
                    </span>
                    {p.full_name}
                  </td>
                  {p.cells.map((c) => (
                    <td
                      key={c.week}
                      className="px-2 py-1 text-center"
                      style={{ background: cellColor(c.value) }}
                      title={`Week ${c.week}: ${c.raw.toFixed(1)} FP`}
                    >
                      {c.raw.toFixed(0)}
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
