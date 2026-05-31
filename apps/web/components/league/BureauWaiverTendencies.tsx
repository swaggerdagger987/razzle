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
  "The Set-and-Forget": "var(--ink-medium)",
  "The Opportunist": "var(--pos-rb)",
};

export function BureauWaiverTendencies({ data, leagueId }: Props) {
  const hawkeye = AGENT_BY_ID.hawkeye;
  const rows = (data.rows as WaiverRow[]) ?? [];
  const leagueLabel = String(data.league_id ?? leagueId);
  const topAdder = rows[0] ?? null;
  const topSpender = [...rows].sort((a, b) => b.faab_spent - a.faab_spent)[0] ?? null;

  const styleCounts = rows.reduce<Record<string, number>>((acc, row) => {
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
              who hammers waivers, who hoards FAAB, who panic-drops
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

      {Object.keys(styleCounts).length > 0 && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            league waiver shape
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(styleCounts)
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

      {topAdder && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            wire hawk
          </p>
          <p className="mt-1 font-bold" style={{ fontFamily: "var(--font-display)" }}>
            {topAdder.team} · {topAdder.adds} adds · {topAdder.faab_spent} FAAB
          </p>
          <p className="text-sm text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
            {topAdder.archetype}
          </p>
          <Link
            href={
              toRoom({
                agentId: "hawkeye",
                question: `${topAdder.team} runs ${topAdder.archetype} on waivers — who are they likely to claim next?`,
                panelSlug: "waiver-tendencies",
              }) as Route
            }
            className="mt-3 inline-block text-sm text-orange underline"
          >
            ask Hawkeye about {topAdder.team} →
          </Link>
        </section>
      )}

      {topSpender && topSpender.roster_id !== topAdder?.roster_id && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            FAAB burner
          </p>
          <p className="mt-1 font-bold" style={{ fontFamily: "var(--font-display)" }}>
            {topSpender.team} · ${topSpender.faab_spent} spent
          </p>
          <p className="text-sm text-ink-medium" style={{ fontFamily: "var(--font-mono)" }}>
            {topSpender.claim_attempts} claim attempts · {topSpender.drops} drops
          </p>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        {rows.map((row) => (
          <article key={row.roster_id} className="chunky bg-bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>
                {row.team}
              </h2>
              <span
                className="text-xs font-bold"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: STYLE_COLORS[row.archetype] ?? "var(--ink)",
                }}
              >
                {row.archetype.replace("The ", "")}
              </span>
            </div>
            <dl
              className="mt-3 grid grid-cols-2 gap-2 text-sm"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <div>
                <dt className="text-ink-light">Adds</dt>
                <dd className="font-bold">{row.adds}</dd>
              </div>
              <div>
                <dt className="text-ink-light">Drops</dt>
                <dd className="font-bold">{row.drops}</dd>
              </div>
              <div>
                <dt className="text-ink-light">FAAB</dt>
                <dd className="font-bold">${row.faab_spent}</dd>
              </div>
              <div>
                <dt className="text-ink-light">Claims</dt>
                <dd className="font-bold">{row.claim_attempts}</dd>
              </div>
            </dl>
          </article>
        ))}
      </section>
    </div>
  );
}
