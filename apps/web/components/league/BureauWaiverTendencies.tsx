"use client";

import { AGENT_BY_ID } from "@razzle/agents";
import { toRoom } from "@razzle/hallway";
import Link from "next/link";
import type { Route } from "next";

interface Props {
  data: Record<string, unknown>;
  leagueId: string;
}

type WaiverRow = {
  roster_id: number;
  team: string;
  adds: number;
  drops: number;
  faab_spent: number;
  claim_attempts: number;
  archetype: string;
};

const ARCHETYPE_COLORS: Record<string, string> = {
  "The Streamer (cheap, frequent)": "var(--pos-wr)",
  "The Hoarder (rare, expensive)": "var(--pos-rb)",
  "The Active Manager (aggressive on both axes)": "var(--orange)",
  "The Set-and-Forget": "var(--pos-qb)",
  "The Opportunist": "var(--ink-medium)",
};

export function BureauWaiverTendencies({ data, leagueId }: Props) {
  const hawkeye = AGENT_BY_ID.hawkeye;
  const rows = (data.rows as WaiverRow[]) ?? [];
  const leagueLabel = String(data.league_id ?? leagueId);
  const hoarder = rows.find((r) => r.archetype.includes("Hoarder")) ?? null;
  const streamer = rows.find((r) => r.archetype.includes("Streamer")) ?? null;
  const hero = hoarder ?? streamer ?? rows[0] ?? null;

  const styleCounts = rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.archetype] = (acc[row.archetype] ?? 0) + 1;
    return acc;
  }, {});

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
              waiver wire tape — who streams, who hoards FAAB, who panic-drops
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Waiver Tendencies
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {rows.length} managers · league {leagueLabel}
        </p>
      </header>

      {Object.keys(styleCounts).length > 0 && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            league waiver shape
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(styleCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([name, count]) => (
                <span
                  key={name}
                  className="text-xs font-bold uppercase"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: ARCHETYPE_COLORS[name] ?? "var(--ink)",
                    border: "2px solid var(--ink)",
                    padding: "0.15rem 0.4rem",
                    background: "var(--bg)",
                    transform: "rotate(-1deg)",
                  }}
                >
                  {name.replace("The ", "")} ×{count}
                </span>
              ))}
          </div>
        </section>
      )}

      {hero && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            wire read
          </p>
          <p className="mt-1 font-bold" style={{ fontFamily: "var(--font-display)" }}>
            {hero.team} · {hero.archetype}
          </p>
          <p className="text-sm text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
            {hero.adds} adds · {hero.drops} drops · ${hero.faab_spent} FAAB · {hero.claim_attempts} claims
          </p>
          <Link
            href={
              toRoom({
                agentId: "hawkeye",
                question: `${hero.team} shows ${hero.archetype} on waivers — who should I block?`,
                panelSlug: "waiver-tendencies",
              }) as Route
            }
            className="mt-3 inline-block text-sm text-orange underline"
          >
            ask Hawkeye about {hero.team} →
          </Link>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        {rows.map((row, i) => (
          <div
            key={row.roster_id}
            className="chunky bg-bg-card p-4"
            style={{ transform: i % 2 === 0 ? "rotate(-0.35deg)" : "rotate(0.35deg)" }}
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <p className="font-bold" style={{ fontFamily: "var(--font-display)" }}>
                  {row.team}
                </p>
                <p className="text-xs text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
                  {row.adds} adds · {row.drops} drops · ${row.faab_spent} FAAB
                </p>
              </div>
              <span
                className="text-[10px] font-bold uppercase"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: ARCHETYPE_COLORS[row.archetype] ?? "var(--ink)",
                  transform: "rotate(-2deg)",
                  border: "2px solid var(--ink)",
                  padding: "0.15rem 0.4rem",
                  background: "var(--bg)",
                }}
              >
                {row.archetype.replace("The ", "")}
              </span>
            </div>
            <p className="text-sm text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
              {row.claim_attempts} claim attempts — predict their next add before the league does.
            </p>
          </div>
        ))}
      </section>

      <footer className="flex flex-wrap gap-4 text-sm">
        <Link href={`/league/${leagueId}/build-profiles` as Route} className="text-orange underline">
          roster build archetypes →
        </Link>
        <Link href={`/league/${leagueId}/trade-finder` as Route} className="text-orange underline">
          find a trade partner →
        </Link>
      </footer>
    </div>
  );
}
