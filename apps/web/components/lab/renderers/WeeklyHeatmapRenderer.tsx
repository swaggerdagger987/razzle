"use client";

import type { PanelDefinition } from "@razzle/panels";
import { PositionPill } from "@razzle/ui";
import { toRoom } from "@razzle/hallway";
import Link from "next/link";
import type { Route } from "next";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { usePlayerSheet } from "@/lib/player-sheet-context";
import { LabOgExportLink, type OgSnapshotRow } from "../LabOgExportLink";
import { PanelAgentHeader, PanelAgentLoading, panelAgent } from "../PanelAgentHeader";

const POSITIONS = ["QB", "RB", "WR", "TE"] as const;

interface PlayerWeek {
  player_id: string;
  name: string;
  position: string;
  team: string;
  ppg?: number;
  weeks: Record<string, number | null>;
}

interface HeatmapData {
  players?: PlayerWeek[];
  weeks?: number[];
  season?: number;
  thresholds?: Record<string, { p80?: number }>;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function cellColor(val: number | null | undefined, p80: number): string {
  if (val == null) return "var(--bg-warm)";
  const intensity = p80 > 0 ? Math.min(1, val / p80) : Math.min(1, val / 25);
  return `color-mix(in srgb, var(--orange) ${Math.round(intensity * 100)}%, var(--bg-card))`;
}

interface Props {
  panel: PanelDefinition;
}

export function WeeklyHeatmapRenderer({ panel }: Props) {
  const { openPlayer } = usePlayerSheet();
  const [position, setPosition] = useState<(typeof POSITIONS)[number]>("WR");
  const agent = panelAgent(panel.slug);

  const q = useQuery({
    queryKey: ["panel", panel.slug, position],
    queryFn: async () => {
      const res = await fetch(`/api/panels/${panel.slug}?position=${position}&limit=25`);
      if (!res.ok) throw new Error(`API ${res.status}`);
      return res.json() as Promise<HeatmapData>;
    },
  });

  const players = q.data?.players ?? [];
  const weekCols = q.data?.weeks ?? [];
  const p80 = q.data?.thresholds?.[position]?.p80 ?? 20;
  const hotPlayer = useMemo(() => {
    let best: { p: PlayerWeek; week: number; pts: number } | null = null;
    for (const p of players) {
      for (const [wk, pts] of Object.entries(p.weeks ?? {})) {
        if (pts != null && (!best || pts > best.pts)) {
          best = { p, week: Number(wk), pts };
        }
      }
    }
    return best;
  }, [players]);

  const ogSnapshotRows = useMemo((): OgSnapshotRow[] => {
    return players.slice(0, 6).map((p) => ({
      name: p.name,
      position: p.position,
      team: p.team,
      stat: p.ppg ?? 0,
      statLabel: "FPTS",
    }));
  }, [players]);

  if (q.isPending) {
    return <PanelAgentLoading agent={agent} />;
  }

  if (q.isError) {
    return <p className="p-6 text-red">something fumbled: {(q.error as Error).message}</p>;
  }

  return (
    <div className="weekly-heatmap">
      <PanelAgentHeader agent={agent} slug={panel.slug} />

      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Filter by position">
        {POSITIONS.map((pos) => (
          <button
            key={pos}
            type="button"
            role="tab"
            aria-selected={position === pos}
            className={`btn-chunky text-sm${position === pos ? " bg-orange text-white" : ""}`}
            onClick={() => setPosition(pos)}
          >
            {pos}
          </button>
        ))}
      </div>

      {q.data?.season && (
        <p className="text-ink-medium mb-4 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {players.length} players · {q.data.season} · darker orange = hotter week
        </p>
      )}

      {!players.length ? (
        <p className="text-ink-medium p-6">{agent.emptyCopy}</p>
      ) : (
        <div className="heatmap-grid chunky bg-bg-card overflow-x-auto p-4">
          <table className="screener-table min-w-full">
            <thead>
              <tr>
                <th>Player</th>
                <th>Pts/g</th>
                {weekCols.map((w) => (
                  <th key={w} className="text-xs">
                    W{w}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {players.map((p) => (
                <tr key={p.player_id}>
                  <td>
                    <button
                      type="button"
                      className="flex items-center gap-1 text-left font-bold hover:underline"
                      onClick={() =>
                        openPlayer({
                          playerId: p.player_id,
                          slug: slugify(p.name),
                          name: p.name,
                          position: p.position,
                          team: p.team,
                        })
                      }
                    >
                      {p.name}
                      <PositionPill position={p.position as "QB" | "RB" | "WR" | "TE"} />
                    </button>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>{p.ppg != null ? p.ppg.toFixed(1) : "—"}</td>
                  {weekCols.map((w) => {
                    const val = p.weeks?.[String(w)] ?? p.weeks?.[w as unknown as string];
                    return (
                      <td
                        key={w}
                        style={{
                          background: cellColor(val, p80),
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.75rem",
                        }}
                        title={val != null ? `${val.toFixed(1)} pts` : "bye/inactive"}
                      >
                        {val != null ? val.toFixed(0) : "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {hotPlayer && (
        <footer className="mt-6 flex flex-wrap items-center gap-4 border-t border-ink pt-4">
          <Link
            href={
              toRoom({
                agentId: "hawkeye",
                panelSlug: "weekly",
                question: `${hotPlayer.p.name} dropped ${hotPlayer.pts.toFixed(1)} in week ${hotPlayer.week} — startable rest of season?`,
              }) as Route
            }
            className="text-sm text-orange underline"
          >
            Ask Hawkeye about {hotPlayer.p.name} →
          </Link>
          <LabOgExportLink
            slug="weekly"
            downloadName="razzle-weekly-heatmap.png"
            snapshotRows={ogSnapshotRows}
            position={position}
          />
        </footer>
      )}
    </div>
  );
}
