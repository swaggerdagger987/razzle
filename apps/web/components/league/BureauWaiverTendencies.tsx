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
  "The Streamer (cheap, frequent)": "var(--pos-rb)",
  "The Hoarder (rare, expensive)": "var(--pos-te)",
  "The Active Manager (aggressive on both axes)": "var(--orange)",
  "The Set-and-Forget": "var(--ink-medium)",
  "The Opportunist": "var(--pos-wr)",
};

export function BureauWaiverTendencies({ data, leagueId }: Props) {
  const hawkeye = AGENT_BY_ID.hawkeye;
  const rows = (data.rows as WaiverRow[]) ?? [];
  const hero = rows.find((r) => r.archetype.includes("Active")) ?? rows[0] ?? null;
  const topAdder = rows[0] ?? null;

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
              who chases waivers, who hoards FAAB, who panic-drops
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Waiver Tendencies
        </h1>
        <p className="mt-1 text-sm text-ink-medium" style={{ fontFamily: "var(--font-mono)" }}>
          {rows.length} managers · sorted by adds this season
        </p>
      </header>

      {hero && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            wire read
          </p>
          <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
            {hero.team} — <strong>{hero.archetype}</strong> ({hero.adds} adds, ${hero.faab_spent} FAAB)
          </p>
          {topAdder && topAdder.roster_id !== hero.roster_id && (
            <p className="mt-2 text-xs text-ink-medium" style={{ fontFamily: "var(--font-mono)" }}>
              most active: {topAdder.team} ({topAdder.adds} adds)
            </p>
          )}
          <Link
            href={
              toRoom({
                agentId: "hawkeye",
                question: `Who should I stash before ${hero.team} makes their next waiver run?`,
                panelSlug: "waiver-tendencies",
              }) as Route
            }
            className="mt-3 inline-block text-sm text-orange underline"
          >
            ask Hawkeye about the wire →
          </Link>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        {rows.map((row, i) => (
          <div
            key={row.roster_id}
            className="chunky bg-bg-card p-4"
            style={{ transform: i % 2 === 0 ? "rotate(-0.4deg)" : "rotate(0.4deg)" }}
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
                className="max-w-[9rem] text-right text-[9px] font-bold uppercase leading-tight"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: ARCHETYPE_COLORS[row.archetype] ?? "var(--ink)",
                  transform: "rotate(-2deg)",
                  border: "2px solid var(--ink)",
                  padding: "0.15rem 0.4rem",
                  background: "var(--bg)",
                }}
              >
                {row.archetype}
              </span>
            </div>
            <p className="text-xs text-ink-medium" style={{ fontFamily: "var(--font-mono)" }}>
              {row.claim_attempts} claim attempts
            </p>
          </div>
        ))}
      </section>

      <footer className="flex flex-wrap items-center gap-4 text-sm">
        <Link href={`/league/${leagueId}/trade-finder` as Route} className="text-orange underline">
          trade finder →
        </Link>
        <Link href={`/league/${leagueId}/build-profiles` as Route} className="text-orange underline">
          build profiles →
        </Link>
      </footer>
    </div>
  );
}
