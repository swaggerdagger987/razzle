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
  const hasError = typeof data.error === "string";
  const yourRank = data.your_rank as number | undefined;
  const yourPpg = data.your_ppg as number | undefined;
  const oppAvg = data.opponent_avg_ppg as number | undefined;
  const verdict = typeof data.verdict === "string" ? data.verdict : "";

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
              remaining path difficulty vs league average scoring
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Strength of Schedule
        </h1>
      </header>

      {hasError && (
        <p className="chunky bg-bg-card p-4 text-sm text-ink-medium">{String(data.error)}</p>
      )}

      {!hasError && yourRank != null && (
        <section className="chunky bg-bg-card p-6">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            your power context
          </p>
          <p className="mt-2 text-2xl" style={{ fontFamily: "var(--font-display)" }}>
            #{yourRank} · {yourPpg ?? "—"} PPG
          </p>
          <p className="text-ink-medium mt-3 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
            league avg opponent scoring: {oppAvg ?? "—"} PPG
          </p>
          <p className="mt-4 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
            {verdict}
          </p>
          {leagueId && (
            <Link
              href={
                toRoom({
                  agentId: "octo",
                  question: `My schedule verdict says: "${verdict}" — what trades hedge a brutal slate?`,
                  panelSlug: "strength-of-schedule",
                }) as Route
              }
              className="mt-4 inline-block text-sm text-orange underline"
            >
              ask Octo about schedule risk →
            </Link>
          )}
        </section>
      )}

      {leagueId && (
        <footer className="flex flex-wrap gap-3 text-sm">
          <Link href={`/league/${leagueId}/power-rankings` as Route} className="text-orange underline">
            power rankings →
          </Link>
          <Link href={`/league/${leagueId}/monte-carlo` as Route} className="text-orange underline">
            monte carlo sims →
          </Link>
        </footer>
      )}
    </div>
  );
}
