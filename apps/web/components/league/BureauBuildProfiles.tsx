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

function archetypeColor(archetype: string): string {
  return ARCHETYPE_COLORS[archetype] ?? "var(--orange)";
}

export function BureauBuildProfiles({ data, leagueId }: Props) {
  const atlas = AGENT_BY_ID.atlas;
  const rows = (data.rows as BuildRow[]) ?? [];
  const archetypeCounts = rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.archetype] = (acc[row.archetype] ?? 0) + 1;
    return acc;
  }, {});
  const dominant =
    Object.entries(archetypeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const spotlight = rows.find((r) => r.archetype === dominant) ?? rows[0] ?? null;

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
              roster construction archetypes — who built what, and why it matters
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Build Profiles
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {rows.length} teams classified · depth tape from league rosters
        </p>
      </header>

      {spotlight && dominant && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            league trend
          </p>
          <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
            {archetypeCounts[dominant]} of {rows.length} teams run a{" "}
            <strong>{dominant}</strong> build — e.g. {spotlight.team} ({spotlight.record}).
          </p>
          <Link
            href={
              toRoom({
                agentId: "atlas",
                question: `How should I counter ${dominant} builds in this league? ${spotlight.team} is the clearest example.`,
                panelSlug: "build-profiles",
              }) as Route
            }
            className="mt-3 inline-block text-sm text-orange underline"
          >
            ask Atlas about {dominant} counters →
          </Link>
        </section>
      )}

      <section className="chunky bg-bg-card p-4">
        <p className="mb-4 text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
          construction board
        </p>
        {!rows.length ? (
          <p className="text-ink-medium text-sm">no roster tape yet — load a league with active rosters.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {rows.map((row, i) => {
              const color = archetypeColor(row.archetype);
              return (
                <li
                  key={row.roster_id}
                  className="chunky bg-bg p-4"
                  style={{ transform: i % 2 === 0 ? "rotate(-0.3deg)" : "rotate(0.3deg)" }}
                >
                  <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-bold" style={{ fontFamily: "var(--font-display)" }}>
                        {row.team}
                      </p>
                      <p className="text-xs text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
                        {row.record}
                      </p>
                    </div>
                    <span
                      className="rotate-[-2deg] rounded border-[3px] border-ink bg-bg-card px-2 py-0.5 text-[10px] font-bold uppercase shadow-[2px_2px_0_#1a1a1a]"
                      style={{ fontFamily: "var(--font-display)", color, borderColor: color }}
                    >
                      {row.archetype}
                    </span>
                  </div>
                  <p className="text-sm text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
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
