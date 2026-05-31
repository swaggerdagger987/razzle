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
  const hero = rows.find((r) => r.archetype === "Zero RB") ?? rows[0] ?? null;
  const archetypeCounts = rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.archetype] = (acc[row.archetype] ?? 0) + 1;
    return acc;
  }, {});
  const dominant =
    Object.entries(archetypeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

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
              roster construction archetypes — how every team is built
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Build Profiles
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {rows.length} teams classified · depth-weighted build logic
        </p>
      </header>

      {dominant && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            league shape
          </p>
          <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
            Most common build: <strong>{dominant}</strong> ({archetypeCounts[dominant]} teams). Trade
            windows favor targeting outliers who do not match the herd.
          </p>
          {hero && (
            <Link
              href={
                toRoom({
                  agentId: "atlas",
                  question: `How should I trade against a ${hero.archetype} build like ${hero.team}?`,
                  panelSlug: "build-profiles",
                }) as Route
              }
              className="mt-3 inline-block text-sm text-orange underline"
            >
              ask {atlas.name} about {hero.team} →
            </Link>
          )}
        </section>
      )}

      <section className="chunky bg-bg-card p-4">
        <p className="mb-4 text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
          team build board
        </p>
        {!rows.length ? (
          <p className="text-ink-medium text-sm">no roster tape yet — connect a league with rosters.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {rows.map((row) => {
              const color = ARCHETYPE_COLORS[row.archetype] ?? "var(--ink-medium)";
              return (
                <li key={row.roster_id} className="chunky bg-bg p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-bold" style={{ fontFamily: "var(--font-display)" }}>
                      {row.team}
                    </span>
                    <span className="text-xs text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
                      {row.record}
                    </span>
                  </div>
                  <p
                    className="mt-2 text-xs uppercase"
                    style={{ fontFamily: "var(--font-mono)", color }}
                  >
                    {row.archetype}
                  </p>
                  <p className="mt-1 text-sm text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
                    {row.reasoning}
                  </p>
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
        <Link href={`/league/${leagueId}/manager-profiles` as Route} className="text-orange underline">
          manager profiles →
        </Link>
        <Link href={`/league/${leagueId}/trade-finder` as Route} className="text-orange underline">
          trade finder →
        </Link>
      </footer>
    </div>
  );
}
