"use client";

import { AGENT_BY_ID } from "@razzle/agents";
import { toRoom } from "@razzle/hallway";
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
  const verdict = String(data.verdict ?? "Schedule strength loading…");
  const diff = yourPpg != null && oppAvg != null ? yourPpg - oppAvg : null;

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
              rest-of-season opponent power vs your scoring pace
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

      <section className="chunky bg-bg-card p-6">
        <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
          your lane
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
              #{yourRank ?? "—"}
            </p>
            <p className="text-xs text-ink-medium" style={{ fontFamily: "var(--font-mono)" }}>
              power rank
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
              {yourPpg != null ? yourPpg.toFixed(1) : "—"}
            </p>
            <p className="text-xs text-ink-medium" style={{ fontFamily: "var(--font-mono)" }}>
              your PPG
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
              {oppAvg != null ? oppAvg.toFixed(1) : "—"}
            </p>
            <p className="text-xs text-ink-medium" style={{ fontFamily: "var(--font-mono)" }}>
              avg opponent PPG
            </p>
          </div>
        </div>
        {diff != null && (
          <p className="mt-4 text-sm font-bold" style={{ fontFamily: "var(--font-mono)", color: diff >= 0 ? "var(--pos-rb)" : "var(--orange)" }}>
            {diff >= 0 ? "+" : ""}
            {diff.toFixed(1)} PPG vs league average opponent
          </p>
        )}
      </section>

      <section className="chunky bg-bg-card p-4" style={{ transform: "rotate(-0.3deg)" }}>
        <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
          Octo verdict
        </p>
        <p className="mt-2 text-lg font-bold" style={{ fontFamily: "var(--font-hand)" }}>
          {verdict}
        </p>
        <Link
          href={
            toRoom({
              agentId: "octo",
              question: `My schedule verdict: "${verdict}" — should I push for playoffs or sell?`,
              panelSlug: "strength-of-schedule",
            }) as Route
          }
          className="mt-3 inline-block text-sm text-orange underline"
        >
          ask Octo about playoff path →
        </Link>
      </section>

      <footer className="flex flex-wrap gap-4 text-sm">
        <Link href={`/league/${leagueId}/power-rankings` as Route} className="text-orange underline">
          full power board →
        </Link>
        <Link href={`/league/${leagueId}/monte-carlo` as Route} className="text-orange underline">
          playoff sims →
        </Link>
      </footer>
    </div>
  );
}
