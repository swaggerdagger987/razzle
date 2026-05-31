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
  const hawkeye = AGENT_BY_ID.hawkeye;

  const depth = (data.depth as Record<string, PosBlock>) ?? {};
  const totalPlayers = Number(data.total_players ?? 0);
  const userId = String(data.user_id ?? "");

  const weakest = POS_ORDER.reduce(
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
              {dolphin.name} · {hawkeye.name}
            </p>
            <p className="text-sm text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
              full depth chart — injury risk on thin spots
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Roster Depth
        </h1>
        <p className="text-ink-medium text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {totalPlayers} players rostered · graded by dynasty value tiers
        </p>
      </header>

      <section className="chunky bg-bg-card p-6">
        <h2 className="text-xl" style={{ fontFamily: "var(--font-display)" }}>
          Position Grades
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {POS_ORDER.map((pos) => {
            const block = depth[pos] ?? {};
            const grade = depthGrade(block);
            const score = depthScore(block);
            const top = [...(block.depth ?? [])].sort(
              (a, b) => (b.dynasty_value ?? 0) - (a.dynasty_value ?? 0),
            )[0];
            const thin = (block.count ?? 0) <= (pos === "QB" || pos === "TE" ? 1 : 2);
            return (
              <div key={pos} className="chunky bg-bg p-4">
                <div className="flex items-center justify-between">
                  <PositionPill position={pos} />
                  <span
                    className="text-3xl font-bold"
                    style={{ fontFamily: "var(--font-display)", transform: "rotate(-2deg)" }}
                  >
                    {grade}
                  </span>
                </div>
                <p className="mt-2 text-2xl" style={{ fontFamily: "var(--font-mono)" }}>
                  {score}
                  <span className="text-sm text-ink-light">/100</span>
                </p>
                <p className="text-xs text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
                  {block.count ?? 0} rostered · {block.elite ?? 0} elite
                </p>
                {top && (
                  <button
                    type="button"
                    className="mt-2 text-left text-sm font-bold hover:text-orange"
                    onClick={() =>
                      openPlayer({
                        playerId: top.player_id,
                        name: top.name,
                        position: pos,
                        slug: slugify(top.name),
                      })
                    }
                  >
                    {top.name}
                    {top.dynasty_value != null ? ` · ${top.dynasty_value}` : ""}
                  </button>
                )}
                {thin && (
                  <Link
                    href={
                      toRoom({
                        agentId: "dolphin",
                        question: `${pos} depth is thin — who is the injury risk on my roster?`,
                      }) as Route
                    }
                    className="mt-2 block text-xs text-purple hover:underline"
                    style={{ fontFamily: "var(--font-hand)" }}
                  >
                    {dolphin.name}: check {pos} health →
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <footer className="flex flex-wrap items-center gap-4 text-sm">
        <Link href={`/league/${leagueId}` as Route} className="text-orange underline">
          self-scout →
        </Link>
        <Link
          href={
            toRoom({
              agentId: "hawkeye",
              question: `Roster depth says ${weakest} is my thinnest spot — trade targets?`,
            }) as Route
          }
          className="text-orange underline"
        >
          ask {hawkeye.name} in film room →
        </Link>
        {userId && (
          <Link
            href={`/og/self-scout?league=${encodeURIComponent(leagueId)}&user=${encodeURIComponent(userId)}&download=1`}
            className="text-orange underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            export self-scout card →
          </Link>
        )}
      </footer>
    </div>
  );
}
