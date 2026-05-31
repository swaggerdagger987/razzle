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
  "The Streamer (cheap, frequent)": "var(--pos-rb)",
  "The Hoarder (rare, expensive)": "var(--pos-qb)",
  "The Active Manager (aggressive on both axes)": "var(--orange)",
  "The Set-and-Forget": "var(--ink-medium)",
  "The Opportunist": "var(--pos-wr)",
};

function styleColor(archetype: string): string {
  return STYLE_COLORS[archetype] ?? "var(--orange)";
}

export function BureauWaiverTendencies({ data, leagueId }: Props) {
  const hawkeye = AGENT_BY_ID.hawkeye;
  const rows = (data.rows as WaiverRow[]) ?? [];
  const aggressor = rows.find((r) => r.archetype.includes("Active")) ?? rows[0] ?? null;
  const maxAdds = Math.max(1, ...rows.map((r) => r.adds));

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
              who hoards FAAB, who panic-drops, who streams every week
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Waiver Tendencies
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {rows.length} managers · transaction tape classified
        </p>
      </header>

      {aggressor && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            waiver radar
          </p>
          <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
            {aggressor.team} — {aggressor.archetype}. {aggressor.adds} adds, ${aggressor.faab_spent} FAAB,{" "}
            {aggressor.drops} drops.
          </p>
          <Link
            href={
              toRoom({
                agentId: "hawkeye",
                question: `Who should I stash before ${aggressor.team} claims them on waivers?`,
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
          <p className="text-ink-medium text-sm">no waiver moves logged yet — sync a league with transactions.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {rows.map((row) => {
              const color = styleColor(row.archetype);
              const addWidth = Math.min(100, Math.max(8, (row.adds / maxAdds) * 100));
              return (
                <li key={row.roster_id} className="pressure-bar-row">
                  <div className="pressure-bar-name">
                    <span className="font-bold" style={{ fontFamily: "var(--font-display)" }}>
                      {row.team}
                    </span>
                    <span className="text-xs text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
                      {" "}
                      {row.adds} adds · {row.drops} drops · ${row.faab_spent} FAAB
                    </span>
                  </div>
                  <div className="pressure-bar-track">
                    <div className="pressure-bar-fill" style={{ width: `${addWidth}%`, background: color }} />
                  </div>
                  <span className="pressure-bar-tag text-xs" style={{ color, borderColor: color }}>
                    {row.archetype.replace("The ", "")}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <footer className="flex flex-wrap items-center gap-4 text-sm">
        <Link href={`/league/${leagueId}/roster-depth` as Route} className="text-orange underline">
          roster depth →
        </Link>
        <Link href={`/league/${leagueId}/trade-finder` as Route} className="text-orange underline">
          trade finder →
        </Link>
        <Link href={`/league/${leagueId}/self-scout` as Route} className="text-orange underline">
          self-scout →
        </Link>
      </footer>
    </div>
  );
}
