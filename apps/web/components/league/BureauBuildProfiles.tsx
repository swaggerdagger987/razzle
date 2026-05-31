"use client";

import { AGENT_BY_ID } from "@razzle/agents";
import { toRoom } from "@razzle/hallway";
import Link from "next/link";
import type { Route } from "next";

interface Props {
  data: Record<string, unknown>;
  leagueId: string;
}

type BuildRow = {
  roster_id: number;
  team: string;
  record: string;
  archetype: string;
  reasoning: string;
};

const ARCHETYPE_COLORS: Record<string, string> = {
  "Hero RB": "var(--pos-rb)",
  "Zero RB": "var(--pos-wr)",
  "Stars & Scrubs": "var(--orange)",
  "Win Now": "var(--pos-qb)",
  "Youth Movement": "var(--pos-te)",
  Balanced: "var(--ink-medium)",
};

export function BureauBuildProfiles({ data, leagueId }: Props) {
  const atlas = AGENT_BY_ID.atlas;
  const rows = (data.rows as BuildRow[]) ?? [];
  const hero = rows[0] ?? null;

  return (
    <div className="flex flex-col gap-6">
      <header className="chunky bg-bg-card p-6">
        <div className="mb-4 flex items-center gap-3">
          <img src={`/agents/${atlas.avatar}.svg`} alt="" className="h-10 w-10" />
          <div>
            <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
              {atlas.name} · {atlas.role}
            </p>
            <p className="text-sm text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
              how every roster is constructed — archetype tape for the whole league
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Build Profiles
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {rows.length} teams classified
        </p>
      </header>

      {hero && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            league snapshot
          </p>
          <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
            {hero.team} leads the board as {hero.archetype} — {hero.reasoning}
          </p>
          <Link
            href={
              toRoom({
                agentId: "atlas",
                question: `Classify trade targets: ${hero.team} is ${hero.archetype}. Who else matches that build?`,
                panelSlug: "build-profiles",
              }) as Route
            }
            className="mt-3 inline-block text-sm text-orange underline"
          >
            ask Atlas about league builds →
          </Link>
        </section>
      )}

      {rows.length === 0 ? (
        <p className="text-ink-medium text-sm" style={{ fontFamily: "var(--font-hand)" }}>
          no roster data yet — sync your league and pull film again.
        </p>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2">
          {rows.map((row, i) => {
            const color = ARCHETYPE_COLORS[row.archetype] ?? "var(--orange)";
            return (
              <div
                key={row.roster_id}
                className="chunky bg-bg-card p-4"
                style={{ transform: i % 2 === 0 ? "rotate(-0.3deg)" : "rotate(0.3deg)" }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold" style={{ fontFamily: "var(--font-display)" }}>
                    {row.team}
                  </p>
                  <span className="text-xs text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
                    {row.record}
                  </span>
                </div>
                <p
                  className="mt-2 text-sm font-bold uppercase"
                  style={{ fontFamily: "var(--font-mono)", color }}
                >
                  {row.archetype}
                </p>
                <p className="mt-2 text-sm text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
                  {row.reasoning}
                </p>
              </div>
            );
          })}
        </section>
      )}

      <footer className="flex flex-wrap items-center gap-4 text-sm">
        <Link href={`/league/${leagueId}/roster-depth` as Route} className="text-orange underline">
          roster depth →
        </Link>
        <Link href={`/league/${leagueId}/power-rankings` as Route} className="text-orange underline">
          power rankings →
        </Link>
      </footer>
    </div>
  );
}
