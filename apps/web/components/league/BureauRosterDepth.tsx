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
  const totalPlayers = Number(data.total_players ?? 0);
  const starters = (data.starters as string[]) ?? [];

  const weakest = POS_ORDER.reduce(
    (min, pos) => ((depth[pos]?.count ?? 0) < (depth[min]?.count ?? 0) ? pos : min),
    "QB" as (typeof POS_ORDER)[number],
  );
  const weakestBlock = depth[weakest] ?? {};

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
              position depth chart — elite count + bench tape
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Roster Depth
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {totalPlayers} rostered · {starters.length} declared starters
        </p>
      </header>

      {weakestBlock.count !== undefined && (weakestBlock.count ?? 0) <= 2 && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            thin spot
          </p>
          <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
            {weakest} depth grade {depthGrade(weakestBlock)} — only {weakestBlock.count ?? 0} bodies on the chart.
          </p>
          <Link
            href={
              toRoom({
                agentId: "dolphin",
                question: `My ${weakest} room is thin (${weakestBlock.count ?? 0} players). What injury or durability risks should I watch?`,
                panelSlug: "injury-report",
              }) as Route
            }
            className="mt-3 inline-block text-sm text-orange underline"
          >
            ask Dolphin about {weakest} risk →
          </Link>
        </section>
      )}

      <section className="chunky bg-bg-card p-6">
        <h2 className="text-xl" style={{ fontFamily: "var(--font-display)" }}>
          Position Depth Board
        </h2>
        <p className="mt-1 text-sm text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
          screenshot this for trade threads — grades from elite assets + bench count
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {POS_ORDER.map((pos) => {
            const block = depth[pos] ?? {};
            const grade = depthGrade(block);
            const score = depthScore(block);
            const top = [...(block.depth ?? [])].sort(
              (a, b) => (b.dynasty_value ?? 0) - (a.dynasty_value ?? 0),
            )[0];
            return (
              <div key={pos} className="chunky bg-bg p-4">
                <div className="mb-2 flex items-center justify-between">
                  <PositionPill position={pos} />
                  <span
                    className="rotate-[-2deg] rounded border-[3px] border-ink bg-bg-card px-2 py-0.5 text-lg font-bold shadow-[2px_2px_0_#1a1a1a]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {grade}
                  </span>
                </div>
                <p className="text-xs text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
                  {block.count ?? 0} players · {block.elite ?? 0} elite
                </p>
                <div className="mt-2 h-2 overflow-hidden rounded border-2 border-ink bg-bg-card">
                  <div
                    className="h-full bg-orange"
                    style={{ width: `${score}%` }}
                    aria-label={`depth score ${score}`}
                  />
                </div>
                {top ? (
                  <button
                    type="button"
                    className="mt-3 w-full text-left text-sm text-orange underline"
                    onClick={() =>
                      openPlayer({
                        playerId: top.player_id,
                        name: top.name,
                        position: pos,
                        slug: slugify(top.name),
                      })
                    }
                  >
                    top: {top.name}
                    {top.dynasty_value != null ? ` (${top.dynasty_value})` : ""}
                  </button>
                ) : (
                  <p className="mt-3 text-xs text-ink-light">no tape at {pos}</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="chunky bg-bg-card p-4">
        <p className="mb-3 text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
          depth list
        </p>
        {!totalPlayers ? (
          <p className="text-ink-medium text-sm">connect Sleeper and load a league roster first.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {POS_ORDER.map((pos) => {
              const players = [...(depth[pos]?.depth ?? [])].sort(
                (a, b) => (b.dynasty_value ?? 0) - (a.dynasty_value ?? 0),
              );
              if (!players.length) return null;
              return (
                <li key={pos}>
                  <p className="mb-2 text-sm font-bold" style={{ fontFamily: "var(--font-display)" }}>
                    {pos}
                  </p>
                  <ul className="flex flex-col gap-1">
                    {players.slice(0, 6).map((p) => (
                      <li key={p.player_id}>
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 rounded px-1 py-0.5 text-left text-sm hover:bg-orange-light"
                          onClick={() =>
                            openPlayer({
                              playerId: p.player_id,
                              name: p.name,
                              position: pos,
                              slug: slugify(p.name),
                            })
                          }
                        >
                          <PositionPill position={pos} />
                          <span>{p.name}</span>
                          {p.dynasty_value != null && (
                            <span className="text-xs text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
                              {p.dynasty_value}
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <footer className="flex flex-wrap items-center gap-4 text-sm">
        <Link href={`/league/${leagueId}` as Route} className="text-orange underline">
          self-scout →
        </Link>
        <Link href={`/league/${leagueId}/head-to-head` as Route} className="text-orange underline">
          head-to-head →
        </Link>
        <Link href={`/league/${leagueId}/trade-finder` as Route} className="text-orange underline">
          trade finder →
        </Link>
      </footer>
    </div>
  );
}
