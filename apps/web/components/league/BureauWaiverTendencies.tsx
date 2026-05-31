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

export function BureauWaiverTendencies({ data, leagueId }: Props) {
  const hawkeye = AGENT_BY_ID.hawkeye;
  const rows = (data.rows as WaiverRow[]) ?? [];
  const busiest = rows[0] ?? null;
  const hoarder = [...rows].sort((a, b) => b.faab_spent - a.faab_spent)[0] ?? null;

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
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {rows.length} managers · transaction fingerprints
        </p>
      </header>

      {busiest && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            wire heat
          </p>
          <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
            <strong>{busiest.team}</strong> leads with {busiest.adds} adds ({busiest.archetype}).
            {hoarder && hoarder.faab_spent > 50 && hoarder.team !== busiest.team && (
              <>
                {" "}
                {hoarder.team} burned ${hoarder.faab_spent} FAAB — predict their next claim window.
              </>
            )}
          </p>
          <Link
            href={
              toRoom({
                agentId: "hawkeye",
                question: `What waiver style should I exploit against ${busiest.team}?`,
                panelSlug: "waiver-tendencies",
              }) as Route
            }
            className="mt-3 inline-block text-sm text-orange underline"
          >
            ask {hawkeye.name} about the wire →
          </Link>
        </section>
      )}

      <section className="chunky bg-bg-card p-4">
        <p className="mb-4 text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
          manager wire profiles
        </p>
        {!rows.length ? (
          <p className="text-ink-medium text-sm">no waiver tape yet — connect a league with transactions.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {rows.map((row) => (
              <li key={row.roster_id} className="chunky bg-bg p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-bold" style={{ fontFamily: "var(--font-display)" }}>
                    {row.team}
                  </span>
                  <span className="text-xs text-orange" style={{ fontFamily: "var(--font-mono)" }}>
                    {row.archetype}
                  </span>
                </div>
                <p className="mt-2 text-xs text-ink-medium" style={{ fontFamily: "var(--font-mono)" }}>
                  {row.adds} adds · {row.drops} drops · ${row.faab_spent} FAAB · {row.claim_attempts} claims
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="flex flex-wrap items-center gap-4 text-sm">
        <Link href={`/league/${leagueId}/build-profiles` as Route} className="text-orange underline">
          build profiles →
        </Link>
        <Link href={`/league/${leagueId}/roster-depth` as Route} className="text-orange underline">
          roster depth →
        </Link>
      </footer>
    </div>
  );
}
