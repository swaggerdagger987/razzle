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
  const verdict = String(data.verdict ?? "");
  const delta =
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
              how brutal your remaining path looks vs league average
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Strength of Schedule
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          league {leagueId.slice(0, 8)}… · power-ranked opponent PPG
        </p>
      </header>

      <section className="chunky bg-bg-card p-6">
        <dl className="grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-ink-medium text-xs uppercase" style={{ fontFamily: "var(--font-mono)" }}>
              Your rank
            </dt>
            <dd className="text-2xl font-bold text-orange" style={{ fontFamily: "var(--font-display)" }}>
              {yourRank != null ? `#${yourRank}` : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-ink-medium text-xs uppercase" style={{ fontFamily: "var(--font-mono)" }}>
              Your PPG
            </dt>
            <dd className="text-2xl font-bold" style={{ fontFamily: "var(--font-mono)" }}>
              {yourPpg != null ? yourPpg.toFixed(1) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-ink-medium text-xs uppercase" style={{ fontFamily: "var(--font-mono)" }}>
              Avg opp PPG
            </dt>
            <dd className="text-2xl font-bold" style={{ fontFamily: "var(--font-mono)" }}>
              {oppAvg != null ? oppAvg.toFixed(1) : "—"}
            </dd>
          </div>
        </dl>
        {delta != null && (
          <p className="text-ink-medium mt-4 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
            differential vs avg opponent: {delta > 0 ? "+" : ""}
            {delta} PPG
          </p>
        )}
        {verdict && (
          <p className="mt-4 text-lg font-bold" style={{ fontFamily: "var(--font-hand)" }}>
            {verdict}
          </p>
        )}
        <Link
          href={
            toRoom({
              agentId: "octo",
              question: `My schedule rates ${verdict || "unknown"} — should I trade for ceiling or floor rest of season?`,
              panelSlug: "strength-of-schedule",
            }) as Route
          }
          className="mt-4 inline-block text-sm text-orange underline"
        >
          ask {octo.name} about your path →
        </Link>
      </section>
    </div>
  );
}
