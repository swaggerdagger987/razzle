"use client";

import { AGENT_BY_ID } from "@razzle/agents";
import { toRoom } from "@razzle/hallway";
import Link from "next/link";
import type { Route } from "next";
import { getSleeperUser } from "@/lib/sleeper";
import { BureauTradeFinderShareBar } from "./BureauTradeFinderShareBar";

interface Props {
  data: Record<string, unknown>;
  leagueId: string;
}

type PlayerRef = {
  player_id: string;
  name: string;
  position: string;
  dynasty_value: number;
};

type Match = {
  partner_roster_id: number;
  partner_team: string;
  give: PlayerRef;
  get: PlayerRef;
  value_gap: number;
  gap_pct: number;
};

export function BureauTradeFinder({ data, leagueId }: Props) {
  const bones = AGENT_BY_ID.bones;
  const matches = (data.matches as Match[]) ?? [];
  const hero = (data.hero_match as Match | null) ?? matches[0] ?? null;
  const needs = (data.needs as string[]) ?? [];
  const surplus = (data.surplus as string[]) ?? [];

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
              fair trades inside your league — not generic rankings
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Trade Finder
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {matches.length} value-matched {matches.length === 1 ? "idea" : "ideas"}
          {needs.length > 0 ? ` · need ${needs.join(", ")}` : ""}
          {surplus.length > 0 ? ` · surplus ${surplus.join(", ")}` : ""}
        </p>
      </header>

      {hero && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            top match
          </p>
          <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
            Send {hero.give.name} ({hero.give.position}, {hero.give.dynasty_value.toLocaleString()}) to{" "}
            {hero.partner_team} for {hero.get.name} ({hero.get.position}, {hero.get.dynasty_value.toLocaleString()}) —{" "}
            {hero.gap_pct}% value gap.
          </p>
          <Link
            href={
              toRoom({
                agentId: "bones",
                question: `Should I offer ${hero.give.name} for ${hero.get.name} from ${hero.partner_team}? Value gap is ${hero.gap_pct}%.`,
                panelSlug: "trade-finder",
                player: {
                  playerId: hero.give.player_id,
                  name: hero.give.name,
                  slug: hero.give.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                  position: hero.give.position,
                },
              }) as Route
            }
            className="mt-3 inline-block text-sm text-orange underline"
          >
            ask Bones about this deal →
          </Link>
          <Link
            href={
              `/league/${leagueId}/monte-carlo?give=${hero.give.player_id}&get=${hero.get.player_id}&partner=${hero.partner_roster_id}` as Route
            }
            className="ml-4 inline-block text-sm text-ink-medium underline"
          >
            re-sim odds →
          </Link>
        </section>
      )}

      {matches.length === 0 ? (
        <p className="text-ink-medium text-sm" style={{ fontFamily: "var(--font-hand)" }}>
          no fair matches yet — rosters look balanced or dynasty values missing. check back after waivers shake things up.
        </p>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2">
          {matches.map((match, i) => (
            <div
              key={`${match.partner_roster_id}-${match.give.player_id}-${match.get.player_id}`}
              className="chunky bg-bg-card p-4"
              style={{ transform: i % 2 === 0 ? "rotate(-0.3deg)" : "rotate(0.3deg)" }}
            >
              <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
                {match.partner_team}
              </p>
              <p className="mt-2 font-bold" style={{ fontFamily: "var(--font-display)" }}>
                {match.give.name}
                <span className="text-ink-light mx-1">→</span>
                {match.get.name}
              </p>
              <p className="text-xs text-ink-light mt-1" style={{ fontFamily: "var(--font-mono)" }}>
                {match.give.position} for {match.get.position} · {match.gap_pct}% gap
              </p>
            </div>
          ))}
        </section>
      )}

      <BureauTradeFinderShareBar
        leagueId={leagueId}
        userId={getSleeperUser()?.user_id ?? "demo"}
      />

      <footer className="flex flex-wrap gap-4 text-sm">
        <Link href={`/league/${leagueId}/pressure-map` as Route} className="text-orange underline">
          pressure map →
        </Link>
        <Link href={`/league/${leagueId}/trade-network` as Route} className="text-orange underline">
          trade network →
        </Link>
        <Link href="/lab/trade-values" className="text-orange underline">
          league-agnostic values →
        </Link>
      </footer>
    </div>
  );
}
