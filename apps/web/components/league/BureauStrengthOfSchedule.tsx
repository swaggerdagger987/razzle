"use client";

import { AGENT_BY_ID } from "@razzle/agents";
import { toRoom } from "@razzle/hallway";
import Link from "next/link";
import type { Route } from "next";
import { BureauStrengthOfScheduleShareBar } from "./BureauStrengthOfScheduleShareBar";

interface Props {
  data: Record<string, unknown>;
  leagueId: string;
}

export function BureauStrengthOfSchedule({ data, leagueId }: Props) {
  const octo = AGENT_BY_ID.octo;
  const yourRank = data.your_rank != null ? Number(data.your_rank) : null;
  const yourPpg = data.your_ppg != null ? Number(data.your_ppg) : null;
  const oppAvg = data.opponent_avg_ppg != null ? Number(data.opponent_avg_ppg) : null;
  const verdict = String(data.verdict ?? "");
  const userId = String(data.user_id ?? "");
  const delta =
    yourPpg != null && oppAvg != null && !Number.isNaN(yourPpg) && !Number.isNaN(oppAvg)
      ? Math.round((yourPpg - oppAvg) * 10) / 10
      : null;

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
              remaining slate strength from live power rankings — not vibes
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Strength of Schedule
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          league {String(data.league_id ?? leagueId)}
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="chunky bg-bg-card p-4" style={{ transform: "rotate(-0.5deg)" }}>
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            your rank
          </p>
          <p className="text-4xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--pos-qb)" }}>
            {yourRank != null ? `#${yourRank}` : "—"}
          </p>
        </div>
        <div className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            your PPG
          </p>
          <p className="text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            {yourPpg != null ? yourPpg.toFixed(1) : "—"}
          </p>
        </div>
        <div className="chunky bg-bg-card p-4" style={{ transform: "rotate(0.5deg)" }}>
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            avg opponent PPG
          </p>
          <p className="text-4xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--orange)" }}>
            {oppAvg != null ? oppAvg.toFixed(1) : "—"}
          </p>
        </div>
      </section>

      {delta != null && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            pace edge vs field
          </p>
          <p className="mt-1 text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            {delta >= 0 ? "+" : ""}
            {delta} PPG vs average opponent
          </p>
        </section>
      )}

      {verdict && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            Octo read
          </p>
          <p className="mt-2 text-lg text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
            {verdict}
          </p>
          <Link
            href={
              toRoom({
                agentId: "octo",
                question: `My strength of schedule says: ${verdict} — how should I attack the next three weeks?`,
                panelSlug: "strength-of-schedule",
              }) as Route
            }
            className="mt-3 inline-block text-sm text-orange underline"
          >
            ask Octo about your slate →
          </Link>
        </section>
      )}

      <footer className="flex flex-col gap-3">
        {userId ? <BureauStrengthOfScheduleShareBar leagueId={leagueId} userId={userId} /> : null}
        <div className="flex flex-wrap gap-4 text-sm">
          <Link href={`/league/${leagueId}/power-rankings` as Route} className="text-orange underline">
            full power rankings →
          </Link>
          <Link href={`/league/${leagueId}/monte-carlo` as Route} className="text-orange underline">
            playoff odds sim →
          </Link>
        </div>
      </footer>
    </div>
  );
}
