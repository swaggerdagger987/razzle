"use client";

import { AGENT_BY_ID } from "@razzle/agents";
import { toRoom } from "@razzle/hallway";
import Link from "next/link";
import type { Route } from "next";
import { BureauTradeNetworkShareBar } from "./BureauTradeNetworkShareBar";

interface Props {
  data: Record<string, unknown>;
  leagueId: string;
}

type Node = { roster_id: number; team: string };
type Edge = { source: number; target: number; trades: number };

export function BureauTradeNetwork({ data, leagueId }: Props) {
  const bones = AGENT_BY_ID.bones;
  const nodes = (data.nodes as Node[]) ?? [];
  const edges = (data.edges as Edge[]) ?? [];
  const teamById = new Map(nodes.map((n) => [n.roster_id, n.team]));
  const hero = edges[0] ?? null;

  return (
    <div className="flex flex-col gap-6">
      <header className="chunky bg-bg-card p-6">
        <div className="mb-4 flex items-center gap-3">
          <img src={`/agents/${bones.avatar}.svg`} alt="" className="h-10 w-10" />
          <div>
            <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
              {bones.name} · {bones.role}
            </p>
            <p className="text-sm text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
              who actually trades with whom in your league
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Trade Network
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {edges.length} partnerships · {nodes.length} managers
        </p>
      </header>

      {hero && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            hottest partnership
          </p>
          <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
            {teamById.get(hero.source) ?? hero.source} ↔ {teamById.get(hero.target) ?? hero.target} —{" "}
            {hero.trades} completed {hero.trades === 1 ? "trade" : "trades"}. Collusion or just best friends?
          </p>
          <Link
            href={
              toRoom({
                agentId: "bones",
                question: `${teamById.get(hero.source)} and ${teamById.get(hero.target)} have traded ${hero.trades} times — should I target one of them?`,
                panelSlug: "trade-network",
              }) as Route
            }
            className="mt-3 inline-block text-sm text-orange underline"
          >
            ask Bones about this pair →
          </Link>
        </section>
      )}

      {edges.length === 0 ? (
        <p className="text-ink-medium text-sm" style={{ fontFamily: "var(--font-hand)" }}>
          no completed trades yet — waivers-only league or early season.
        </p>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2">
          {edges.map((edge, i) => (
            <div
              key={`${edge.source}-${edge.target}`}
              className="chunky bg-bg-card p-4"
              style={{ transform: i % 2 === 0 ? "rotate(-0.3deg)" : "rotate(0.3deg)" }}
            >
              <p className="font-bold" style={{ fontFamily: "var(--font-display)" }}>
                {teamById.get(edge.source) ?? `Team ${edge.source}`}
                <span className="text-ink-light mx-1">↔</span>
                {teamById.get(edge.target) ?? `Team ${edge.target}`}
              </p>
              <p className="text-xs text-ink-light mt-1" style={{ fontFamily: "var(--font-mono)" }}>
                {edge.trades} trade{edge.trades === 1 ? "" : "s"}
              </p>
            </div>
          ))}
        </section>
      )}

      <footer className="flex flex-wrap items-center gap-4 text-sm">
        <BureauTradeNetworkShareBar leagueId={leagueId} />
        <Link href={`/league/${leagueId}/manager-profiles` as Route} className="text-orange underline">
          manager profiles →
        </Link>
        <Link href={`/league/${leagueId}/pressure-map` as Route} className="text-orange underline">
          pressure map →
        </Link>
        <Link href={`/league/${leagueId}/trade-finder` as Route} className="text-orange underline">
          trade finder →
        </Link>
      </footer>
    </div>
  );
}
