"use client";

import { AGENT_BY_ID } from "@razzle/agents";
import { toRoom } from "@razzle/hallway";
import { PositionPill } from "@razzle/ui";
import Link from "next/link";
import type { Route } from "next";
import { useCallback, useMemo, useState } from "react";
import {
  buildRosterDepthOgSnapshot,
  encodeBureauRosterDepthOgSnapshot,
} from "@/lib/bureau-roster-depth-og-snapshot";
import { getSleeperUser } from "@/lib/sleeper";
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

export function BureauRosterDepth({ data, leagueId }: Props) {
  const { openPlayer } = usePlayerSheet();
  const hawkeye = AGENT_BY_ID.hawkeye;
  const dolphin = AGENT_BY_ID.dolphin;
  const [copied, setCopied] = useState(false);
  const sleeperUser = getSleeperUser();
  const userId = sleeperUser?.user_id ?? "";

  const depth = (data.depth as Record<string, PosBlock>) ?? {};
  const totalPlayers = Number(data.total_players ?? 0);
  const starters = (data.starters as string[]) ?? [];

  const ogSnapshot = useMemo(
    () => buildRosterDepthOgSnapshot(depth, { totalPlayers }),
    [depth, totalPlayers],
  );
  const snapshotParam = encodeBureauRosterDepthOgSnapshot(ogSnapshot);
  const depthPath = `/league/${leagueId}/roster-depth`;
  const ogParams = new URLSearchParams({ league: leagueId, download: "1" });
  if (userId) ogParams.set("user", userId);
  if (snapshotParam) ogParams.set("snapshot", snapshotParam);

  const copyDepthLink = useCallback(async () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}${depthPath}` : depthPath;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [depthPath]);

  const weakest = POS_ORDER.reduce(
    (min, pos) => ((depth[pos]?.count ?? 0) < (depth[min]?.count ?? 0) ? pos : min),
    "QB" as (typeof POS_ORDER)[number],
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="chunky bg-bg-card p-6">
        <div className="mb-4 flex items-center gap-3">
          <img src={`/agents/${hawkeye.avatar}.svg`} alt="" className="h-10 w-10" />
          <div>
            <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
              {hawkeye.name} · {hawkeye.role}
            </p>
            <p className="text-sm text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
              full depth chart — every roster spot graded
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Roster Depth
        </h1>
        <p className="text-ink-medium text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {totalPlayers} players · {starters.length} starters flagged
        </p>
      </header>

      <section className="chunky bg-bg-card p-6">
        <h2 className="text-xl" style={{ fontFamily: "var(--font-display)" }}>
          Position depth chart
        </h2>
        <p className="mt-1 text-sm text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
          tap a name for Player Sheet — thin {weakest} gets Dolphin health lane
        </p>
        <div className="mt-4 flex flex-col gap-6">
          {POS_ORDER.map((pos) => {
            const block = depth[pos] ?? {};
            const grade = depthGrade(block);
            const players = [...(block.depth ?? [])].sort(
              (a, b) => (b.dynasty_value ?? 0) - (a.dynasty_value ?? 0),
            );
            const thin = (block.count ?? 0) <= (pos === "QB" || pos === "TE" ? 1 : 2);

            return (
              <div key={pos} className="chunky bg-bg p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <PositionPill position={pos} />
                    <span
                      className="text-2xl font-bold"
                      style={{ fontFamily: "var(--font-display)", transform: "rotate(-2deg)" }}
                    >
                      {grade}
                    </span>
                  </div>
                  <span className="text-xs text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
                    {block.count ?? 0} rostered · {block.elite ?? 0} elite
                  </span>
                </div>
                <ul className="flex flex-col gap-1">
                  {players.length === 0 ? (
                    <li className="text-sm text-ink-light" style={{ fontFamily: "var(--font-hand)" }}>
                      no {pos} on roster
                    </li>
                  ) : (
                    players.map((p) => (
                      <li key={p.player_id}>
                        <button
                          type="button"
                          className="flex w-full items-center justify-between gap-2 rounded px-1 py-1 text-left text-sm hover:bg-bg-warm"
                          onClick={() =>
                            openPlayer({
                              playerId: p.player_id,
                              name: p.name,
                              position: pos,
                              slug: slugify(p.name),
                            })
                          }
                        >
                          <span className="font-bold">
                            {p.name}
                            {starters.includes(p.player_id) ? (
                              <span className="text-ink-light ml-1 text-xs">· starter</span>
                            ) : null}
                          </span>
                          <span className="text-ink-light text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                            {p.dynasty_value != null ? p.dynasty_value : "—"}
                          </span>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
                {thin && (
                  <Link
                    href={
                      toRoom({
                        agentId: "dolphin",
                        question: `${pos} depth is thin on my roster — injury risk?`,
                        panelSlug: "roster-depth",
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
        <Link
          href={
            toRoom({
              agentId: "hawkeye",
              question: `Roster depth says ${weakest} is my thinnest spot — who should I stash or trade for?`,
              panelSlug: "roster-depth",
            }) as Route
          }
          className="btn-chunky mt-4 inline-block text-sm bg-bg"
        >
          ask {hawkeye.name} in film room →
        </Link>
        {leagueId && userId ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button type="button" className="btn-chunky text-xs" onClick={() => void copyDepthLink()}>
              {copied ? "copied!" : "copy depth link"}
            </button>
            <a
              href={`/og/roster-depth?${ogParams.toString()}`}
              download="razzle-roster-depth.png"
              className="btn-chunky active text-xs"
              style={{ background: "var(--orange)", color: "var(--text-on-accent)" }}
            >
              export card
            </a>
          </div>
        ) : null}
        <Link
          href={`/league/${leagueId}/self-scout` as Route}
          className="ml-3 inline-block text-sm text-ink-medium underline"
        >
          open Self-Scout →
        </Link>
      </section>
    </div>
  );
}
