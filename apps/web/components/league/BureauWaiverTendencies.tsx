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
  const aggressor = [...rows].sort((a, b) => b.adds - a.adds)[0] ?? null;
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
              who streams, who hoards FAAB, and what to expect on Tuesday
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Waiver Tendencies
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {rows.length} teams · adds, drops, FAAB spend, archetype
        </p>
      </header>

      {aggressor && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            most active
          </p>
          <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
            {aggressor.team} — {aggressor.adds} adds, ${aggressor.faab_spent} FAAB ({aggressor.archetype}).
          </p>
          <Link
            href={
              toRoom({
                agentId: "hawkeye",
                question: `What waiver moves should I expect from ${aggressor.team} this week?`,
                panelSlug: "waiver-tendencies",
              }) as Route
            }
            className="mt-3 inline-block text-sm text-orange underline"
          >
            ask Hawkeye about {aggressor.team} →
          </Link>
        </section>
      )}

      <section className="chunky bg-bg-card p-4">
        <p className="mb-4 text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
          league waiver board
        </p>
        {!rows.length ? (
          <p className="text-ink-medium text-sm">no waiver tape yet — league needs completed claims.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {rows.map((row) => (
              <li key={row.roster_id} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-ink/10 pb-2">
                <span className="font-bold" style={{ fontFamily: "var(--font-display)" }}>
                  {row.team}
                </span>
                <span className="text-sm text-ink-medium" style={{ fontFamily: "var(--font-mono)" }}>
                  +{row.adds} / −{row.drops} · ${row.faab_spent} FAAB
                </span>
                <span
                  className="w-full text-xs uppercase tracking-wide"
                  style={{ fontFamily: "var(--font-hand)", color: "var(--pos-wr)" }}
                >
                  {row.archetype}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {hoarder && hoarder.roster_id !== aggressor?.roster_id && (
        <p className="text-sm text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
          FAAB leader: {hoarder.team} (${hoarder.faab_spent} spent).
        </p>
      )}

      <footer className="flex flex-wrap gap-4 text-sm">
        <Link href={`/league/${leagueId}/trade-finder` as Route} className="text-orange underline">
          trade finder →
        </Link>
        <Link href={`/league/${leagueId}/head-to-head` as Route} className="text-orange underline">
          head-to-head →
        </Link>
      </footer>
    </div>
  );
}
