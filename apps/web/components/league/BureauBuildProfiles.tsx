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

function archetypeColor(archetype: string): string {
  return ARCHETYPE_COLORS[archetype] ?? "var(--purple)";
}

export function BureauBuildProfiles({ data, leagueId }: Props) {
  const atlas = AGENT_BY_ID.atlas;
  const rows = (data.rows as BuildRow[]) ?? [];
  const counts = rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.archetype] = (acc[row.archetype] ?? 0) + 1;
    return acc;
  }, {});
  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

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
              roster archetypes — who is built to win now vs rebuild
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Build Profiles
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {rows.length} teams classified · depth tape → archetype label
        </p>
      </header>

      {dominant && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            league shape
          </p>
          <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
            Most common build: <strong>{dominant}</strong> ({counts[dominant]} of {rows.length} teams).
            Screenshot this board before you pitch a trade — mismatched timelines get rejected.
          </p>
          <Link
            href={
              toRoom({
                agentId: "atlas",
                question: `This league skews ${dominant} — who is the outlier I can exploit?`,
                panelSlug: "build-profiles",
              }) as Route
            }
            className="mt-3 inline-block text-sm text-orange underline"
          >
            ask Atlas about league builds →
          </Link>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        {!rows.length ? (
          <p className="text-ink-medium text-sm">no roster tape yet — connect a league with active rosters.</p>
        ) : (
          rows.map((row, i) => {
            const color = archetypeColor(row.archetype);
            return (
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
                      question: `${row.team} is a ${row.archetype} build — what precedent should I cite in trade talks?`,
                      panelSlug: "build-profiles",
                    }) as Route
                  }
                  className="mt-2 inline-block text-xs text-orange underline"
                >
                  ask Atlas about {row.team} →
                </Link>
              </div>
            );
          })
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
        <Link href={`/league/${leagueId}/head-to-head` as Route} className="text-orange underline">
          head-to-head →
        </Link>
      </footer>
    </div>
  );
}
