"use client";

import { AGENT_BY_ID } from "@razzle/agents";
import { toLeague, toRoom } from "@razzle/hallway";
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

function archetypeColor(archetype: string): string {
  return ARCHETYPE_COLORS[archetype] ?? "var(--ink)";
}

export function BureauBuildProfiles({ data, leagueId }: Props) {
  const atlas = AGENT_BY_ID.atlas;
  const rows = (data.rows as BuildRow[]) ?? [];
  const counts = rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.archetype] = (acc[row.archetype] ?? 0) + 1;
    return acc;
  }, {});
  const dominant =
    Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Balanced";
  const outlier = rows.find((r) => r.archetype !== dominant) ?? rows[0] ?? null;

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
              roster construction archetypes across the league
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Build Profiles
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {rows.length} teams classified · {dominant} is the league default
        </p>
      </header>

      {outlier && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            construction outlier
          </p>
          <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
            {outlier.team} runs {outlier.archetype} while most of the league is {dominant} — trade
            windows open when styles clash.
          </p>
          <Link
            href={
              toRoom({
                agentId: "atlas",
                question: `${outlier.team} is a ${outlier.archetype} in a ${dominant} league — what's the historical trade pattern?`,
                panelSlug: "build-profiles",
              }) as Route
            }
            className="mt-3 inline-block text-sm text-purple underline"
          >
            ask {atlas.name} about {outlier.team} →
          </Link>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        {rows.map((row, i) => (
          <div
            key={row.roster_id}
            className="chunky bg-bg-card p-4"
            style={{ transform: i % 2 === 0 ? "rotate(-0.4deg)" : "rotate(0.4deg)" }}
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
                  color: archetypeColor(row.archetype),
                  transform: "rotate(-2deg)",
                  border: "2px solid var(--ink)",
                  padding: "0.15rem 0.4rem",
                  background: "var(--bg)",
                }}
              >
                {row.archetype}
              </span>
            </div>
            <p className="text-sm text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
              {row.reasoning}
            </p>
          </div>
        ))}
      </section>

      <footer className="flex flex-wrap items-center gap-4 text-sm">
        <Link href={toLeague(leagueId) as Route} className="text-orange underline">
          self-scout →
        </Link>
        <Link href={`/league/${leagueId}/manager-profiles` as Route} className="text-orange underline">
          manager profiles →
        </Link>
        <Link
          href={
            toRoom({
              agentId: "atlas",
              question: `Most teams here are ${dominant} — who built differently and why?`,
              panelSlug: "build-profiles",
            }) as Route
          }
          className="text-orange underline"
        >
          ask {atlas.name} for league history →
        </Link>
      </footer>
    </div>
  );
}
