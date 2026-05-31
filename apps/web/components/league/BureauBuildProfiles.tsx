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

export function BureauBuildProfiles({ data, leagueId }: Props) {
  const atlas = AGENT_BY_ID.atlas;
  const rows = (data.rows as BuildRow[]) ?? [];
  const hero = rows.find((r) => r.archetype === "Win Now") ?? rows[0] ?? null;
  const archetypeCounts = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.archetype] = (acc[r.archetype] ?? 0) + 1;
    return acc;
  }, {});
  const dominant =
    Object.entries(archetypeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Balanced";

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
              how every manager built their roster — archetype tape from depth charts
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Build Profiles
        </h1>
        <p className="mt-1 text-sm text-ink-medium" style={{ fontFamily: "var(--font-mono)" }}>
          {rows.length} teams · league skews {dominant}
        </p>
      </header>

      {hero && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            spotlight build
          </p>
          <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
            {hero.team} — {hero.archetype}: {hero.reasoning}
          </p>
          <Link
            href={
              toRoom({
                agentId: "atlas",
                question: `How does ${hero.team}'s ${hero.archetype} build compare to the rest of this league?`,
                panelSlug: "build-profiles",
              }) as Route
            }
            className="mt-3 inline-block text-sm text-orange underline"
          >
            ask Atlas about {hero.team} →
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
                  {row.record}
                </p>
              </div>
              <span
                className="text-[10px] font-bold uppercase"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: ARCHETYPE_COLORS[row.archetype] ?? "var(--orange)",
                  transform: "rotate(-2deg)",
                }}
              >
                {row.archetype}
              </span>
            </div>
            <p className="text-sm text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
              {row.reasoning}
            </p>
            <Link
              href={
                toRoom({
                  agentId: "atlas",
                  question: `Trade angle on ${row.team} (${row.archetype})?`,
                  panelSlug: "build-profiles",
                }) as Route
              }
              className="mt-2 inline-block text-xs text-orange underline"
            >
              hallway → Room
            </Link>
          </div>
        ))}
      </section>

      {rows.length === 0 && (
        <p className="text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
          {atlas.emptyCopy}
        </p>
      )}
    </div>
  );
}
