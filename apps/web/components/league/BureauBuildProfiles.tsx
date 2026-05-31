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
  "Win Now": "var(--green)",
  "Youth Movement": "var(--pos-qb)",
  Balanced: "var(--ink-medium)",
};

function archetypeCount(rows: BuildRow[], archetype: string): number {
  return rows.filter((r) => r.archetype === archetype).length;
}

export function BureauBuildProfiles({ data, leagueId }: Props) {
  const atlas = AGENT_BY_ID.atlas;
  const rows = (data.rows as BuildRow[]) ?? [];
  const dominant =
    rows.reduce<Record<string, number>>((acc, r) => {
      acc[r.archetype] = (acc[r.archetype] ?? 0) + 1;
      return acc;
    }, {}) ?? {};
  const leagueArchetype =
    Object.entries(dominant).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Balanced";
  const spotlight = rows.find((r) => r.archetype === "Zero RB") ?? rows[0] ?? null;

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
              roster construction archetypes — who built for now vs dynasty runway
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Build Profiles
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {rows.length} teams classified · league leans {leagueArchetype}
        </p>
      </header>

      {spotlight && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            construction read
          </p>
          <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
            {spotlight.team} runs {spotlight.archetype} ({spotlight.record}) — {spotlight.reasoning}
          </p>
          <Link
            href={
              toRoom({
                agentId: "atlas",
                question: `How does ${spotlight.team}'s ${spotlight.archetype} build compare to the rest of the league?`,
                panelSlug: "build-profiles",
              }) as Route
            }
            className="mt-3 inline-block text-sm text-orange underline"
          >
            ask {atlas.name} about {spotlight.team} →
          </Link>
        </section>
      )}

      <section className="chunky bg-bg-card p-6">
        <h2 className="text-xl" style={{ fontFamily: "var(--font-display)" }}>
          League Archetypes
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.keys(ARCHETYPE_COLORS).map((label) => {
            const n = archetypeCount(rows, label);
            if (!n) return null;
            return (
              <span
                key={label}
                className="chunky bg-bg px-3 py-1 text-xs"
                style={{ fontFamily: "var(--font-mono)", borderColor: ARCHETYPE_COLORS[label] }}
              >
                {label} ×{n}
              </span>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {rows.map((row, i) => (
          <div
            key={row.roster_id}
            className="chunky bg-bg-card p-4"
            style={{ transform: i % 2 === 0 ? "rotate(-0.5deg)" : "rotate(0.5deg)" }}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-lg" style={{ fontFamily: "var(--font-display)" }}>
                  {row.team}
                </h3>
                <p className="text-xs text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
                  {row.record}
                </p>
              </div>
              <span
                className="chunky bg-bg px-2 py-1 text-xs font-bold uppercase"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: ARCHETYPE_COLORS[row.archetype] ?? "var(--ink)",
                  transform: "rotate(-2deg)",
                }}
              >
                {row.archetype}
              </span>
            </div>
            <p className="mt-2 text-sm text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
              {row.reasoning}
            </p>
            <Link
              href={
                toRoom({
                  agentId: "atlas",
                  question: `${row.team} is a ${row.archetype} build — who should I target in trades?`,
                  panelSlug: "build-profiles",
                }) as Route
              }
              className="mt-2 inline-block text-xs text-orange underline"
            >
              ask {atlas.name} →
            </Link>
          </div>
        ))}
      </section>

      <footer className="flex flex-wrap items-center gap-4 text-sm">
        <Link href={`/league/${leagueId}/manager-profiles` as Route} className="text-orange underline">
          manager profiles →
        </Link>
        <Link href={`/league/${leagueId}/power-rankings` as Route} className="text-orange underline">
          power rankings →
        </Link>
        <Link href={`/league/${leagueId}/trade-network` as Route} className="text-orange underline">
          trade network →
        </Link>
      </footer>
    </div>
  );
}
