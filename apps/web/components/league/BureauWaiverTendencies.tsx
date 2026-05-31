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

const STYLE_COLORS: Record<string, string> = {
  "The Streamer (cheap, frequent)": "var(--pos-wr)",
  "The Hoarder (rare, expensive)": "var(--pos-te)",
  "The Active Manager (aggressive on both axes)": "var(--orange)",
  "The Set-and-Forget": "var(--ink-medium)",
  "The Opportunist": "var(--pos-rb)",
};

export function BureauWaiverTendencies({ data, leagueId }: Props) {
  const hawkeye = AGENT_BY_ID.hawkeye;
  const rows = (data.rows as WaiverRow[]) ?? [];
  const leagueLabel = String(data.league_id ?? leagueId);
  const topAdder = rows[0] ?? null;
  const hoarder = rows.find((r) => r.archetype.includes("Hoarder")) ?? null;
  const hero = topAdder ?? hoarder ?? rows[0] ?? null;

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
              who chases waivers, who hoards FAAB, who panic-drops — predict the wire before Wednesday
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Waiver Tendencies
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {rows.length} teams · league {leagueLabel}
        </p>
      </header>

      {Object.keys(styleCounts).length > 0 && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            wire personality mix
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(styleCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([name, count]) => (
                <span
                  key={name}
                  className="text-xs font-bold"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: STYLE_COLORS[name] ?? "var(--ink)",
                    border: "2px solid var(--ink)",
                    padding: "0.15rem 0.4rem",
                    background: "var(--bg)",
                    transform: "rotate(-1deg)",
                  }}
                >
                  {name} ×{count}
                </span>
              ))}
          </div>
        </section>
      )}

      {hero && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            scout lens
          </p>
          <p className="mt-1 font-bold" style={{ fontFamily: "var(--font-display)" }}>
            {hero.team} · {hero.archetype}
          </p>
          <p className="text-sm text-ink-medium" style={{ fontFamily: "var(--font-mono)" }}>
            {hero.adds} adds · {hero.drops} drops · ${hero.faab_spent} FAAB spent · {hero.claim_attempts} claims
          </p>
          <Link
            href={
              toRoom({
                agentId: "hawkeye",
                question: `${hero.team} shows "${hero.archetype}" on waivers — who are they likely to target next week?`,
                panelSlug: "waiver-tendencies",
              }) as Route
            }
            className="mt-3 inline-block text-sm text-orange underline"
          >
            ask Hawkeye about {hero.team} →
          </Link>
        </section>
      )}

      <section className="table-wrap chunky bg-bg-card overflow-x-auto">
        <table className="screener-table">
          <thead className="thead-shadow">
            <tr>
              <th>Team</th>
              <th className="text-right">Adds</th>
              <th className="text-right">Drops</th>
              <th className="text-right">FAAB</th>
              <th>Style</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.roster_id} className="screener-row">
                <td className="font-bold">{row.team}</td>
                <td className="text-right" style={{ fontFamily: "var(--font-mono)" }}>
                  {row.adds}
                </td>
                <td className="text-right" style={{ fontFamily: "var(--font-mono)" }}>
                  {row.drops}
                </td>
                <td className="text-right" style={{ fontFamily: "var(--font-mono)" }}>
                  ${row.faab_spent}
                </td>
                <td>
                  <span
                    className="text-[10px] font-bold"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: STYLE_COLORS[row.archetype] ?? "var(--ink)",
                    }}
                  >
                    {row.archetype}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer className="flex flex-wrap gap-4 text-sm">
        <Link href={`/league/${leagueId}/build-profiles` as Route} className="text-orange underline">
          roster build archetypes →
        </Link>
        <Link href={`/league/${leagueId}/trade-finder` as Route} className="text-orange underline">
          find a trade partner →
        </Link>
        <Link href="/lab/breakouts" className="text-orange underline">
          breakout watch lab panel →
        </Link>
      </footer>
    </div>
  );
}
