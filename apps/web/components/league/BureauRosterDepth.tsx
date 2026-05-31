"use client";

import { AGENT_BY_ID } from "@razzle/agents";
import { toLeague, toRoom } from "@razzle/hallway";
import { PositionPill } from "@razzle/ui";
import Link from "next/link";
import type { Route } from "next";
import { usePlayerSheet } from "@/lib/player-sheet-context";

interface Props {
  data: Record<string, unknown>;
  leagueId: string;
}

type DepthPlayer = {
  player_id: string;
  name: string;
  position: string;
  dynasty_value?: number | null;
};

type PosBlock = {
  count?: number;
  elite?: number;
  depth?: DepthPlayer[];
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

function gradeColor(grade: string): string {
  if (grade === "A") return "var(--green)";
  if (grade === "B") return "var(--teal)";
  if (grade === "C") return "var(--orange)";
  if (grade === "D") return "var(--orange)";
  return "var(--red)";
}

function thinThreshold(pos: string, count: number): boolean {
  return count <= (pos === "QB" || pos === "TE" ? 1 : 2);
}

export function BureauRosterDepth({ data, leagueId }: Props) {
  const { openPlayer } = usePlayerSheet();
  const dolphin = AGENT_BY_ID.dolphin;
  const hawkeye = AGENT_BY_ID.hawkeye;

  const depth = (data.depth as Record<string, PosBlock>) ?? {};
  const totalPlayers = (data.total_players as number) ?? 0;
  const starters = (data.starters as string[]) ?? [];

  const weakest = POS_ORDER.reduce(
    (min, pos) => ((depth[pos]?.count ?? 0) < (depth[min]?.count ?? 0) ? pos : min),
    "QB" as (typeof POS_ORDER)[number],
  );

  const eliteTotal = POS_ORDER.reduce((sum, pos) => sum + (depth[pos]?.elite ?? 0), 0);

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
              dynasty depth chart — who backs up your starters?
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Roster Depth
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {totalPlayers} rostered · {eliteTotal} elite assets · {starters.length} starters set
        </p>
      </header>

      <section className="chunky bg-bg-card p-4">
        <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
          thinnest spot
        </p>
        <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
          {weakest} is your shallowest position — injury here hurts most.
        </p>
        <Link
          href={
            toRoom({
              agentId: "dolphin",
              question: `${weakest} depth is thin on my roster — who is the injury risk?`,
              panelSlug: "roster-depth",
            }) as Route
          }
          className="mt-3 inline-block text-sm text-purple underline"
        >
          ask {dolphin.name} about {weakest} health →
        </Link>
      </section>

      <div className="flex flex-col gap-4">
        {POS_ORDER.map((pos) => {
          const block = depth[pos] ?? {};
          const grade = depthGrade(block);
          const score = depthScore(block);
          const players = [...(block.depth ?? [])].sort(
            (a, b) => (b.dynasty_value ?? 0) - (a.dynasty_value ?? 0),
          );
          const thin = thinThreshold(pos, block.count ?? 0);
          const color = gradeColor(grade);

          return (
            <section key={pos} className="chunky bg-bg-card p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <PositionPill position={pos} />
                  <span
                    className="text-2xl font-bold"
                    style={{ fontFamily: "var(--font-display)", color, transform: "rotate(-2deg)" }}
                  >
                    {grade}
                  </span>
                  <span className="text-sm text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
                    {score}/100 · {block.count ?? 0} rostered · {block.elite ?? 0} elite
                  </span>
                </div>
                {thin && (
                  <Link
                    href={
                      toRoom({
                        agentId: "dolphin",
                        question: `${pos} depth is thin — which starter is most fragile?`,
                        panelSlug: "roster-depth",
                      }) as Route
                    }
                    className="text-xs text-purple underline"
                    style={{ fontFamily: "var(--font-hand)" }}
                  >
                    {dolphin.name}: injury scan →
                  </Link>
                )}
              </div>

              {!players.length ? (
                <p className="text-ink-medium text-sm">no {pos} on roster — waiver target needed.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {players.map((player, idx) => {
                    const isStarter = starters.includes(player.player_id);
                    return (
                      <li
                        key={player.player_id}
                        className={`flex items-center justify-between rounded px-3 py-2 ${isStarter ? "bg-orange-light" : "bg-bg"}`}
                      >
                        <button
                          type="button"
                          className="text-left text-sm font-bold hover:text-orange"
                          onClick={() =>
                            openPlayer({
                              playerId: player.player_id,
                              name: player.name,
                              position: pos,
                              slug: slugify(player.name),
                            })
                          }
                        >
                          {idx + 1}. {player.name}
                          {isStarter && (
                            <span className="ml-2 text-xs text-orange" style={{ fontFamily: "var(--font-mono)" }}>
                              starter
                            </span>
                          )}
                        </button>
                        <span className="text-xs text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
                          {player.dynasty_value != null ? player.dynasty_value : "—"}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      <footer className="flex flex-wrap items-center gap-4 text-sm">
        <Link href={toLeague(leagueId) as Route} className="text-orange underline">
          self-scout →
        </Link>
        <Link href={`/league/${leagueId}/trade-finder` as Route} className="text-orange underline">
          trade finder →
        </Link>
        <Link
          href={
            toRoom({
              agentId: "hawkeye",
              question: `Roster depth says ${weakest} is thinnest — who should I target on waivers?`,
              panelSlug: "roster-depth",
            }) as Route
          }
          className="text-orange underline"
        >
          ask {hawkeye.name} for targets →
        </Link>
      </footer>
    </div>
  );
}
