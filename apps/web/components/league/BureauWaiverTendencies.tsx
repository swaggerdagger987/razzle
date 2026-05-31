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
  const hero = rows[0] ?? null;

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
              who claims, who drops, and what waiver style each manager runs
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Waiver Tendencies
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {rows.length} managers · transaction tape from Sleeper waivers
        </p>
      </header>

      {hero && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            most active
          </p>
          <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
            {hero.team} — {hero.adds} adds, {hero.drops} drops, ${hero.faab_spent} FAAB ({hero.archetype}).
          </p>
          <Link
            href={
              toRoom({
                agentId: "hawkeye",
                question: `${hero.team} runs a ${hero.archetype} waiver style — who should I target before they claim my guy?`,
                panelSlug: "waiver-tendencies",
              }) as Route
            }
            className="mt-3 inline-block text-sm text-orange underline"
          >
            ask Hawkeye about {hero.team} →
          </Link>
        </section>
      )}

      <section className="chunky bg-bg-card p-4">
        <p className="mb-4 text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
          waiver wire board
        </p>
        {!rows.length ? (
          <p className="text-ink-medium text-sm">no waiver moves logged yet — early season or offline league.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {rows.map((row, i) => (
              <li
                key={row.roster_id}
                className="chunky bg-bg p-4"
                style={{ transform: i % 2 === 0 ? "rotate(-0.2deg)" : "rotate(0.2deg)" }}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-bold" style={{ fontFamily: "var(--font-display)" }}>{row.team}</p>
                    <p className="text-xs text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
                      {row.adds} adds · {row.drops} drops · ${row.faab_spent} FAAB · {row.claim_attempts} claims
                    </p>
                  </div>
                  <span
                    className="text-[10px] font-bold uppercase text-orange"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {row.archetype}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="flex flex-wrap items-center gap-4 text-sm">
        <Link href={`/league/${leagueId}/build-profiles` as Route} className="text-orange underline">
          build profiles →
        </Link>
        <Link href={`/league/${leagueId}/trade-finder` as Route} className="text-orange underline">
          trade finder →
        </Link>
      </footer>
    </div>
  );
}
