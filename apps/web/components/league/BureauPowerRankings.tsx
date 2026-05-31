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
  roster_id: number;
  rank: number;
  team: string;
  record: string;
  ppg: number;
  opp_ppg: number;
  differential: number;
  expected_wins: number;
  luck: number;
};

function luckLabel(luck: number): string {
  if (luck >= 1.5) return "running hot";
  if (luck <= -1.5) return "due for wins";
  return "on script";
}

function luckColor(luck: number): string {
  if (luck >= 1.5) return "var(--green)";
  if (luck <= -1.5) return "var(--red)";
  return "var(--ink-medium)";
}

export function BureauPowerRankings({ data, leagueId }: Props) {
  const octo = AGENT_BY_ID.octo;
  const rows = (data.rows as PowerRow[]) ?? [];
  const leader = rows[0] ?? null;
  const unluckiest = [...rows].sort((a, b) => a.luck - b.luck)[0] ?? null;
  const hottest = [...rows].sort((a, b) => b.luck - a.luck)[0] ?? null;

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
              points-for power index — record lies, differential doesn&apos;t
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Power Rankings
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {rows.length} teams ranked · pythagorean luck vs actual wins
        </p>
      </header>

      {leader && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            true #1
          </p>
          <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
            <strong>{leader.team}</strong> leads on +{leader.differential} PPG margin ({leader.record}).
            {unluckiest && unluckiest.luck < -0.5 && (
              <>
                {" "}
                {unluckiest.team} is {Math.abs(unluckiest.luck).toFixed(1)} wins below expectation — buy-low
                trade target.
              </>
            )}
          </p>
          {hottest && hottest.luck > 0.5 && (
            <Link
              href={
                toRoom({
                  agentId: "octo",
                  question: `Is ${hottest.team} actually this good, or just lucky at ${hottest.record}?`,
                  panelSlug: "power-rankings",
                }) as Route
              }
              className="mt-3 inline-block text-sm text-orange underline"
            >
              ask {octo.name} about luck vs talent →
            </Link>
          )}
        </section>
      )}

      <section className="chunky bg-bg-card p-4">
        <p className="mb-4 text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
          league power board
        </p>
        {!rows.length ? (
          <p className="text-ink-medium text-sm">no standings tape yet — connect a league with scores.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {rows.map((row) => (
              <li key={row.roster_id} className="chunky bg-bg p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-bold" style={{ fontFamily: "var(--font-display)" }}>
                    #{row.rank} {row.team}
                  </span>
                  <span className="text-xs text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
                    {row.record}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-4 text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                  <span>
                    {row.ppg} PF · {row.opp_ppg} PA
                  </span>
                  <span className="text-orange">+{row.differential} margin</span>
                  <span style={{ color: luckColor(row.luck) }}>
                    luck {row.luck >= 0 ? "+" : ""}
                    {row.luck} ({luckLabel(row.luck)})
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink-light" style={{ fontFamily: "var(--font-hand)" }}>
                  expected {row.expected_wins} wins from scoring profile
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="flex flex-wrap items-center gap-4 text-sm">
        <Link href={`/league/${leagueId}/monte-carlo` as Route} className="text-orange underline">
          monte carlo sims →
        </Link>
        <Link href={`/league/${leagueId}/build-profiles` as Route} className="text-orange underline">
          build profiles →
        </Link>
        <Link href={`/league/${leagueId}/trade-finder` as Route} className="text-orange underline">
          trade finder →
        </Link>
      </footer>
    </div>
  );
}
