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

function thinDepth(pos: string, block: PosBlock): boolean {
  const count = block.count ?? 0;
  if (pos === "QB" || pos === "TE") return count <= 1;
  return count <= 2;
}

function injuryRiskLabel(pos: string, block: PosBlock): string {
  if (thinDepth(pos, block)) return "thin — one injury away";
  if ((block.elite ?? 0) === 0 && (block.count ?? 0) >= 2) return "depth without elite anchor";
  return "stable starter pool";
}

export function BureauRosterDepth({ data, leagueId }: Props) {
  const { openPlayer } = usePlayerSheet();
  const dolphin = AGENT_BY_ID.dolphin;
  const depth = (data.depth as Record<string, PosBlock>) ?? {};
  const total = Number(data.total_players ?? 0);
  const thinPositions = POS_ORDER.filter((pos) => thinDepth(pos, depth[pos] ?? {}));

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
              position depth chart — who breaks if someone goes down
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Roster Depth
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {total} players rostered · elite assets + bench depth by position
        </p>
      </header>

      {thinPositions.length > 0 && (
        <section className="chunky bg-bg-card p-4" style={{ borderColor: "var(--purple)" }}>
          <p className="text-xs uppercase text-purple" style={{ fontFamily: "var(--font-mono)" }}>
            vulnerability flags
          </p>
          <p className="mt-2 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
            Thin at {thinPositions.join(", ")} — injury or bye week hits hardest here.
          </p>
          <Link
            href={
              toRoom({
                agentId: "dolphin",
                question: `My roster is thin at ${thinPositions.join(" and ")} — who is most at risk if a starter misses time?`,
                panelSlug: "roster-depth",
              }) as Route
            }
            className="mt-3 inline-block text-sm text-purple underline"
          >
            ask {dolphin.name} about injury exposure →
          </Link>
        </section>
      )}

      <section className="chunky bg-bg-card p-6">
        <h2 className="text-xl" style={{ fontFamily: "var(--font-display)" }}>
          Depth by position
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {POS_ORDER.map((pos) => {
            const block = depth[pos] ?? {};
            const players = [...(block.depth ?? [])].sort(
              (a, b) => (b.dynasty_value ?? 0) - (a.dynasty_value ?? 0),
            );
            const risk = injuryRiskLabel(pos, block);
            return (
              <div key={pos} className="chunky bg-bg p-4">
                <div className="flex items-center justify-between">
                  <PositionPill position={pos} />
                  <span className="text-xs text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
                    {block.count ?? 0} · {block.elite ?? 0} elite
                  </span>
                </div>
                <p className="mt-2 text-sm text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
                  {risk}
                </p>
                <ul className="mt-3 flex flex-col gap-1">
                  {players.slice(0, 5).map((p) => (
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
                  ))}
                  {!players.length && (
                    <li className="text-xs text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
                      no players at this position
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="flex flex-wrap items-center gap-4 text-sm">
        <Link href={`/league/${leagueId}` as Route} className="text-orange underline">
          self-scout grades →
        </Link>
        <Link href={`/league/${leagueId}/head-to-head` as Route} className="text-orange underline">
          head-to-head →
        </Link>
        <Link
          href={
            toRoom({
              agentId: "hawkeye",
              question: "Which waiver targets fix my thinnest position depth?",
            }) as Route
          }
          className="text-orange underline"
        >
          ask Hawkeye for targets →
        </Link>
      </footer>
    </div>
  );
}
