"use client";

import { AGENT_BY_ID } from "@razzle/agents";
import { toLeague, toRoom } from "@razzle/hallway";
import Link from "next/link";
import type { Route } from "next";

interface Props {
  data: Record<string, unknown>;
  leagueId: string;
}

export function BureauStrengthOfSchedule({ data, leagueId }: Props) {
  const octo = AGENT_BY_ID.octo;
  const yourRank = data.your_rank as number | undefined;
  const yourPpg = data.your_ppg as number | undefined;
  const oppAvg = data.opponent_avg_ppg as number | undefined;
  const verdict = (data.verdict as string) ?? "Schedule strength loading from power ranks.";

  const diff =
    yourPpg != null && oppAvg != null ? Math.round((yourPpg - oppAvg) * 10) / 10 : null;

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
              remaining opponents ranked by scoring power — not vibes
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Strength of Schedule
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {yourRank != null ? `#${yourRank} by power · ` : ""}
          {yourPpg != null ? `${yourPpg} your PPG vs ${oppAvg ?? "—"} avg opponent` : "connect Sleeper for schedule read"}
        </p>
      </header>

      <section className="chunky bg-bg-card p-6">
        <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
          schedule verdict
        </p>
        <p className="mt-2 text-lg" style={{ fontFamily: "var(--font-hand)" }}>
          {verdict}
        </p>
        {diff != null && (
          <p className="text-ink-medium mt-3 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
            scoring edge vs avg opponent: {diff > 0 ? "+" : ""}
            {diff} PPG
          </p>
        )}
        <Link
          href={
            toRoom({
              agentId: "octo",
              question: `My schedule verdict is "${verdict}" — how should I adjust roster strategy?`,
              panelSlug: "strength-of-schedule",
            }) as Route
          }
          className="mt-4 inline-block text-sm text-orange underline"
        >
          ask {octo.name} about playoff path →
        </Link>
      </section>

      <footer className="flex flex-wrap items-center gap-4 text-sm">
        <Link href={toLeague(leagueId) as Route} className="text-orange underline">
          self-scout →
        </Link>
        <Link href={`/league/${leagueId}/power-rankings` as Route} className="text-orange underline">
          league power rankings →
        </Link>
        <Link href={`/league/${leagueId}/monte-carlo` as Route} className="text-orange underline">
          monte carlo sims →
        </Link>
      </footer>
    </div>
  );
}
