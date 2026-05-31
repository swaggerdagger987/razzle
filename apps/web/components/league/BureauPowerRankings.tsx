"use client";

import { AGENT_BY_ID } from "@razzle/agents";
import { toRoom } from "@razzle/hallway";
import Link from "next/link";
import type { Route } from "next";

interface Props {
  data: Record<string, unknown>;
  leagueId: string;
}

type PowerRow = {
  rank: number;
  roster_id: number;
  team: string;
  record: string;
  ppg: number;
  opp_ppg: number;
  differential: number;
  expected_wins: number;
  luck: number;
};

function diffColor(diff: number): string {
  if (diff >= 8) return "var(--green)";
  if (diff >= 0) return "var(--orange)";
  return "var(--red)";
}

export function BureauPowerRankings({ data, leagueId }: Props) {
  const octo = AGENT_BY_ID.octo;
  const rows = (data.rows as PowerRow[]) ?? [];
  const leader = rows[0] ?? null;

  return (
    <div className="flex flex-col gap-6">
      <header className="chunky bg-bg-card p-6">
        <div className="mb-4 flex items-center gap-3">
          <img src={`/agents/${octo.avatar}.svg`} alt="" className="h-10 w-10" />
          <div>
            <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
              {octo.name} · {octo.role}
            </p>
            <p className="text-sm text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
              beyond W-L — points differential and luck-adjusted wins
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Power Rankings
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          sorted by scoring differential · pythagorean luck index
        </p>
      </header>

      {leader && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            #1 by differential
          </p>
          <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
            {leader.team} ({leader.record}) — {leader.ppg} PPG vs {leader.opp_ppg} allowed (
            {leader.differential > 0 ? "+" : ""}
            {leader.differential}). Luck vs expected: {leader.luck > 0 ? "+" : ""}
            {leader.luck} wins.
          </p>
          <Link
            href={
              toRoom({
                agentId: "octo",
                question: `Why does ${leader.team} rank #1 on power when their record is ${leader.record}?`,
                panelSlug: "power-rankings",
              }) as Route
            }
            className="mt-3 inline-block text-sm text-orange underline"
          >
            ask Octo about {leader.team} →
          </Link>
        </section>
      )}

      <section className="chunky bg-bg-card p-4">
        <p className="mb-4 text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
          league power board
        </p>
        {!rows.length ? (
          <p className="text-ink-medium text-sm">no roster tape yet — connect a league with games played.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {rows.map((row) => {
              const color = diffColor(row.differential);
              const barWidth = Math.min(100, Math.max(8, 50 + row.differential * 3));
              return (
                <li key={row.roster_id} className="pressure-bar-row">
                  <div className="pressure-bar-name">
                    <span className="font-bold" style={{ fontFamily: "var(--font-display)" }}>
                      #{row.rank} {row.team}
                    </span>
                    <span className="text-xs text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
                      {" "}
                      {row.record} · {row.ppg} PPG
                    </span>
                  </div>
                  <div className="pressure-bar-track">
                    <div className="pressure-bar-fill" style={{ width: `${barWidth}%`, background: color }} />
                  </div>
                  <span className="pressure-bar-score" style={{ color }}>
                    {row.differential > 0 ? "+" : ""}
                    {row.differential}
                  </span>
                  <span className="pressure-bar-tag text-xs" style={{ color, borderColor: color }}>
                    luck {row.luck > 0 ? "+" : ""}
                    {row.luck}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <footer className="flex flex-wrap items-center gap-4 text-sm">
        <a
          href={`/og/power-rankings?league=${encodeURIComponent(leagueId)}&download=1`}
          className="text-orange underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          export OG card →
        </a>
        <Link href={`/league/${leagueId}/monte-carlo` as Route} className="text-orange underline">
          monte carlo →
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
