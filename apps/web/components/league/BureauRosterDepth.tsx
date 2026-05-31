"use client";

import { AGENT_BY_ID } from "@razzle/agents";
import { toRoom } from "@razzle/hallway";
import { PositionPill } from "@razzle/ui";
import Link from "next/link";
import type { Route } from "next";
import { usePlayerSheet } from "@/lib/player-sheet-context";

interface Props {
  data: Record<string, unknown>;
  leagueId: string;
}

type PosBlock = {
  count?: number;
  elite?: number;
  depth?: Array<{ player_id: string; name: string; position: string; dynasty_value?: number | null }>;
};

const POS_ORDER = ["QB", "RB", "WR", "TE"] as const;

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function depthGrade(block: PosBlock): string {
  const count = block.count ?? 0;
  const elite = block.elite ?? 0;
  if (count === 0) return "F";
  if (elite >= 2 || (elite >= 1 && count >= 4)) return "A";
  if (elite >= 1 || count >= 3) return "B";
  if (count >= 2) return "C";
  return "D";
}

function depthScore(block: PosBlock): number {
  const count = block.count ?? 0;
  const elite = block.elite ?? 0;
  const values = (block.depth ?? []).map((p) => p.dynasty_value ?? 0);
  const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  return Math.min(100, Math.round(elite * 25 + count * 12 + avg / 10));
}

export function BureauRosterDepth({ data, leagueId }: Props) {
  const { openPlayer } = usePlayerSheet();
  const dolphin = AGENT_BY_ID.dolphin;
  const depth = (data.depth as Record<string, PosBlock>) ?? {};
  const total = Number(data.total_players ?? 0);
  const thinnest = POS_ORDER.reduce(
    (min, pos) => ((depth[pos]?.count ?? 0) < (depth[min]?.count ?? 0) ? pos : min),
    "QB" as (typeof POS_ORDER)[number],
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="chunky bg-bg-card p-6">
        <div className="mb-4 flex items-center gap-3">
          <img src={`/agents/${dolphin.avatar}.svg`} alt="" className="h-10 w-10" />
          <div>
            <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
              {dolphin.name} · {dolphin.role}
            </p>
            <p className="text-sm text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
              position depth chart — injury risk and bench tape
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Roster Depth
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {total} players rostered · grades from elite count + dynasty value stack
        </p>
      </header>

      <section className="chunky bg-bg-card p-6">
        <h2 className="text-xl" style={{ fontFamily: "var(--font-display)" }}>
          Depth by position
        </h2>
        <p className="mt-1 text-sm text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
          screenshot the thin spots before you trade
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {POS_ORDER.map((pos) => {
            const block = depth[pos] ?? {};
            const grade = depthGrade(block);
            const score = depthScore(block);
            const players = [...(block.depth ?? [])].sort(
              (a, b) => (b.dynasty_value ?? 0) - (a.dynasty_value ?? 0),
            );
            const thin = (block.count ?? 0) <= (pos === "QB" || pos === "TE" ? 1 : 2);
            return (
              <div key={pos} className="chunky bg-bg p-4">
                <div className="mb-3 flex items-center justify-between">
                  <PositionPill position={pos} />
                  <span
                    className="text-3xl font-bold"
                    style={{ fontFamily: "var(--font-display)", transform: "rotate(-2deg)" }}
                  >
                    {grade}
                  </span>
                </div>
                <p className="text-2xl" style={{ fontFamily: "var(--font-mono)" }}>
                  {score}
                  <span className="text-sm text-ink-light">/100</span>
                  <span className="ml-2 text-xs text-ink-light">
                    {block.count ?? 0} · {block.elite ?? 0} elite
                  </span>
                </p>
                <ul className="mt-3 flex flex-col gap-1">
                  {players.length ? (
                    players.map((p) => (
                      <li key={p.player_id}>
                        <button
                          type="button"
                          className="text-left text-sm hover:text-orange"
                          onClick={() =>
                            openPlayer({
                              playerId: p.player_id,
                              name: p.name,
                              position: pos,
                              slug: slugify(p.name),
                            })
                          }
                        >
                          {p.name}
                          {p.dynasty_value != null ? (
                            <span className="text-ink-light"> · {p.dynasty_value}</span>
                          ) : null}
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-ink-light">no {pos} on roster</li>
                  )}
                </ul>
                {thin && (
                  <Link
                    href={
                      toRoom({
                        agentId: "dolphin",
                        question: `${pos} depth is thin — who is one injury away from empty?`,
                        panelSlug: "roster-depth",
                      }) as Route
                    }
                    className="mt-2 block text-xs text-purple hover:underline"
                    style={{ fontFamily: "var(--font-hand)" }}
                  >
                    ask {dolphin.name} about {pos} risk →
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <footer className="flex flex-wrap items-center gap-4 text-sm">
        <Link
          href={
            toRoom({
              agentId: "dolphin",
              question: `My thinnest spot is ${thinnest} — roster health check?`,
            }) as Route
          }
          className="text-orange underline"
        >
          film room · {dolphin.name} →
        </Link>
        <Link href={`/league/${leagueId}/self-scout` as Route} className="text-orange underline">
          self-scout →
        </Link>
        <Link href={`/league/${leagueId}/trade-finder` as Route} className="text-orange underline">
          trade finder →
        </Link>
        <Link href={`/league/${leagueId}/head-to-head` as Route} className="text-orange underline">
          head-to-head →
        </Link>
      </footer>
    </div>
  );
}
