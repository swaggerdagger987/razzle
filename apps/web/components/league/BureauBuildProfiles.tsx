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
  const counts = rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.archetype] = (acc[row.archetype] ?? 0) + 1;
    return acc;
  }, {});
  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const spotlight = rows.find((r) => r.archetype === "Stars & Scrubs") ?? rows[0] ?? null;

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
          {rows.length} teams classified · league skew: {dominant ?? "—"}
        </p>
      </header>

      {dominant && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            league meta
          </p>
          <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
            {counts[dominant]} of {rows.length} teams run {dominant} — trade windows tilt toward the outliers.
          </p>
        </section>
      )}

      {spotlight && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            spotlight build
          </p>
          <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
            {spotlight.team} ({spotlight.record}) — {spotlight.archetype}. {spotlight.reasoning}
          </p>
          <Link
            href={
              toRoom({
                agentId: "atlas",
                question: `How should I trade against ${spotlight.team}'s ${spotlight.archetype} build?`,
                panelSlug: "build-profiles",
              }) as Route
            }
            className="mt-3 inline-block text-sm text-orange underline"
          >
            ask Atlas about {spotlight.team} →
          </Link>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        {rows.map((row, i) => {
          const color = ARCHETYPE_COLORS[row.archetype] ?? "var(--orange)";
          return (
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
                    color,
                    border: `2px solid ${color}`,
                    padding: "2px 6px",
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
                    question: `What trades fit a ${row.archetype} team like ${row.team}?`,
                    panelSlug: "build-profiles",
                  }) as Route
                }
                className="mt-3 inline-block text-xs text-orange underline"
              >
                room →
              </Link>
            </div>
          );
        })}
      </section>

      {!rows.length && (
        <p className="text-ink-medium text-sm">no roster tape yet — connect a league with active rosters.</p>
      )}

      <footer className="flex flex-wrap items-center gap-4 text-sm">
        <Link href={`/league/${leagueId}/manager-profiles` as Route} className="text-orange underline">
          manager profiles →
        </Link>
        <Link href={`/league/${leagueId}/trade-network` as Route} className="text-orange underline">
          trade network →
        </Link>
        <Link href={`/league/${leagueId}/self-scout` as Route} className="text-orange underline">
          self-scout →
        </Link>
      </footer>
    </div>
  );
}
