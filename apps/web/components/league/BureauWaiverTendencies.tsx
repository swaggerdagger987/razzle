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
  "The Streamer (cheap, frequent)": "var(--pos-wr)",
  "The Hoarder (rare, expensive)": "var(--pos-te)",
  "The Active Manager (aggressive on both axes)": "var(--orange)",
  "The Set-and-Forget": "var(--ink-light)",
  "The Opportunist": "var(--pos-rb)",
};

export function BureauWaiverTendencies({ data, leagueId }: Props) {
  const hawkeye = AGENT_BY_ID.hawkeye;
  const rows = (data.rows as WaiverRow[]) ?? [];
  const leagueLabel = String(data.league_id ?? leagueId);
  const topAdder = rows[0] ?? null;
  const hoarder = rows.find((r) => r.archetype.includes("Hoarder")) ?? null;
  const streamer = rows.find((r) => r.archetype.includes("Streamer")) ?? null;

  const archetypeCounts = rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.archetype] = (acc[row.archetype] ?? 0) + 1;
    return acc;
  }, {});

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
              who chases waivers, who hoards FAAB, who panic-drops
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Waiver Tendencies
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {rows.length} teams · league {leagueLabel}
        </p>
      </header>

      {Object.keys(archetypeCounts).length > 0 && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            league wire habits
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(archetypeCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([name, count]) => (
                <span
                  key={name}
                  className="text-xs font-bold uppercase"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: STYLE_COLORS[name] ?? "var(--ink)",
                    border: "2px solid var(--ink)",
                    padding: "0.15rem 0.4rem",
                    background: "var(--bg)",
                    transform: "rotate(-1deg)",
                  }}
                >
                  {name.replace("The ", "")} ×{count}
                </span>
              ))}
          </div>
        </section>
      )}

      {(hoarder || streamer) && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            waiver intel
          </p>
          {streamer && (
            <p className="mt-2 text-sm text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
              <strong>{streamer.team}</strong> streams adds ({streamer.adds} claims, ${streamer.faab_spent} FAAB)
            </p>
          )}
          {hoarder && (
            <p className="mt-1 text-sm text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
              <strong>{hoarder.team}</strong> hoards FAAB ({hoarder.faab_spent} spent on {hoarder.adds} adds)
            </p>
          )}
          {topAdder && (
            <Link
              href={
                toRoom({
                  agentId: "hawkeye",
                  question: `Who should I block on waivers before ${topAdder.team} claims again?`,
                  panelSlug: "waiver-tendencies",
                }) as Route
              }
              className="mt-3 inline-block text-sm text-orange underline"
            >
              ask Hawkeye about the wire →
            </Link>
          )}
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
                  {row.adds} adds · {row.drops} drops · ${row.faab_spent} FAAB
                </p>
              </div>
              <span
                className="max-w-[9rem] text-right text-[10px] font-bold uppercase leading-tight"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: STYLE_COLORS[row.archetype] ?? "var(--ink)",
                  transform: "rotate(-2deg)",
                  border: "2px solid var(--ink)",
                  padding: "0.15rem 0.4rem",
                  background: "var(--bg)",
                }}
              >
                {row.archetype.replace("The ", "")}
              </span>
            </div>
            <p className="text-xs text-ink-medium" style={{ fontFamily: "var(--font-mono)" }}>
              {row.claim_attempts} claim attempts
            </p>
          </div>
        ))}
      </section>

      <footer className="flex flex-wrap gap-4 text-sm">
        <Link href={`/league/${leagueId}/build-profiles` as Route} className="text-orange underline">
          roster build archetypes →
        </Link>
        <Link href={`/league/${leagueId}/manager-profiles` as Route} className="text-orange underline">
          manager behavior profiles →
        </Link>
        <Link href={`/league/${leagueId}/trade-finder` as Route} className="text-orange underline">
          find a trade partner →
        </Link>
      </footer>
    </div>
  );
}
