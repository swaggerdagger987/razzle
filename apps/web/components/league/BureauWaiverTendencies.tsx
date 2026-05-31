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

const ARCHETYPE_COLORS: Record<string, string> = {
  "The Streamer (cheap, frequent)": "var(--teal)",
  "The Hoarder (rare, expensive)": "var(--purple)",
  "The Active Manager (aggressive on both axes)": "var(--orange)",
  "The Set-and-Forget": "var(--ink-light)",
  "The Opportunist": "var(--blue)",
};

export function BureauWaiverTendencies({ data, leagueId }: Props) {
  const hawkeye = AGENT_BY_ID.hawkeye;
  const rows = (data.rows as WaiverRow[]) ?? [];
  const hasError = typeof data.error === "string";
  const hot = rows.find((r) => r.adds >= 8) ?? rows[0] ?? null;

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
              who chases waivers, who hoards FAAB, and who you can outbid next week
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Waiver Tendencies
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {rows.length > 0 ? `${rows.length} managers profiled` : "connect a league to scout waiver habits"}
        </p>
      </header>

      {hasError && (
        <p className="chunky bg-bg-card p-4 text-sm text-ink-medium">{String(data.error)}</p>
      )}

      {hot && !hasError && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            waiver radar
          </p>
          <p className="mt-1 font-bold" style={{ fontFamily: "var(--font-display)" }}>
            {hot.team} · {hot.archetype}
          </p>
          <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
            {hot.adds} adds · ${hot.faab_spent} FAAB · {hot.claim_attempts} claims
          </p>
          <Link
            href={
              toRoom({
                agentId: "hawkeye",
                question: `How do I outbid ${hot.team} on the next waiver run?`,
                panelSlug: "waiver-tendencies",
              }) as Route
            }
            className="mt-3 inline-block text-sm text-orange underline"
          >
            ask Hawkeye about {hot.team} →
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
              <p className="font-bold" style={{ fontFamily: "var(--font-display)" }}>
                {row.team}
              </p>
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
            <dl
              className="grid grid-cols-3 gap-2 text-center text-xs"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <div>
                <dt className="text-ink-light">adds</dt>
                <dd className="font-bold">{row.adds}</dd>
              </div>
              <div>
                <dt className="text-ink-light">drops</dt>
                <dd className="font-bold">{row.drops}</dd>
              </div>
              <div>
                <dt className="text-ink-light">FAAB</dt>
                <dd className="font-bold">${row.faab_spent}</dd>
              </div>
            </dl>
          </div>
        ))}
      </section>

      {leagueId && (
        <footer className="flex flex-wrap gap-3 text-sm">
          <Link href={`/league/${leagueId}/self-scout` as Route} className="text-orange underline">
            ← back to Self-Scout
          </Link>
          <Link
            href={
              toRoom({
                agentId: "hawkeye",
                question: "Who is most likely to burn FAAB on a breakout WR this week?",
              }) as Route
            }
            className="text-purple underline"
            style={{ fontFamily: "var(--font-hand)" }}
          >
            ask Hawkeye for waiver intel →
          </Link>
        </footer>
      )}
    </div>
  );
}
