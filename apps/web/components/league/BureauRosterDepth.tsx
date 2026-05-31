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

function thinAtPosition(pos: string, block: PosBlock): boolean {
  const count = block.count ?? 0;
  return count <= (pos === "QB" || pos === "TE" ? 1 : 2);
}

export function BureauRosterDepth({ data, leagueId }: Props) {
  const { openPlayer } = usePlayerSheet();
  const dolphin = AGENT_BY_ID.dolphin;
  const depth = (data.depth as Record<string, PosBlock>) ?? {};
  const total = Number(data.total_players ?? 0);
  const starters = (data.starters as string[]) ?? [];

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
              {dolphin.name} · {dolphin.role}
            </p>
            <p className="text-sm text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
              position depth chart — elite count, dynasty tape, injury exposure
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Roster Depth
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {total} rostered · {starters.length} starters flagged
        </p>
      </header>

      <section className="chunky bg-bg-card p-6">
        <h2 className="text-xl" style={{ fontFamily: "var(--font-display)" }}>
          Position depth board
        </h2>
        <p className="mt-1 text-sm text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
          screenshot this before waivers — grades mirror Self-Scout, sorted by dynasty value
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {POS_ORDER.map((pos) => {
            const block = depth[pos] ?? {};
            const grade = depthGrade(block);
            const players = [...(block.depth ?? [])].sort(
              (a, b) => (b.dynasty_value ?? 0) - (a.dynasty_value ?? 0),
            );
            const thin = thinAtPosition(pos, block);
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
                <p className="mt-2 text-xs text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
                  {block.count ?? 0} rostered · {block.elite ?? 0} elite tier
                </p>
                {!players.length ? (
                  <p className="mt-3 text-sm text-ink-medium">no {pos} on roster yet.</p>
                ) : (
                  <ul className="mt-3 flex flex-col gap-1">
                    {players.slice(0, 6).map((p) => (
                      <li key={p.player_id}>
                        <button
                          type="button"
                          className="text-left text-sm font-bold hover:text-orange"
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
                            <span className="text-xs text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
                              {" "}
                              · {p.dynasty_value}
                            </span>
                          ) : null}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {thin && (
                  <Link
                    href={
                      toRoom({
                        agentId: "dolphin",
                        question: `${pos} depth is thin on my roster — who is the injury risk?`,
                        panelSlug: "roster-depth",
                      }) as Route
                    }
                    className="mt-3 block text-xs text-purple hover:underline"
                    style={{ fontFamily: "var(--font-hand)" }}
                  >
                    {dolphin.name}: stress-test {pos} health →
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
        <Link href={`/league/${leagueId}/trade-finder` as Route} className="text-orange underline">
          trade finder →
        </Link>
        <Link
          href={
            toRoom({
              agentId: "dolphin",
              question: `Roster depth says ${weakest} is my thinnest spot — who should I stash or cut?`,
            }) as Route
          }
          className="text-purple underline"
        >
          ask {dolphin.name} in film room →
        </Link>
      </footer>
    </div>
  );
}
