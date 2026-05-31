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
  const yourRank = data.your_rank != null ? Number(data.your_rank) : null;
  const yourPpg = Number(data.your_ppg ?? 0);
  const oppAvg = Number(data.opponent_avg_ppg ?? 0);
  const verdict = String(data.verdict ?? "");
  const delta = yourPpg - oppAvg;

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
              how brutal is the rest of your schedule?
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Strength of Schedule
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          your power vs league average opponent
        </p>
      </header>

      <section className="chunky bg-bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
              your PPG
            </p>
            <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
              {yourPpg.toFixed(1)}
            </p>
            {yourRank != null && (
              <p className="text-xs text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
                rank #{yourRank}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
              avg opponent PPG
            </p>
            <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
              {oppAvg.toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
              edge
            </p>
            <p
              className="text-2xl font-bold"
              style={{
                fontFamily: "var(--font-display)",
                color: delta >= 0 ? "var(--green)" : "var(--red)",
              }}
            >
              {delta >= 0 ? "+" : ""}
              {delta.toFixed(1)}
            </p>
          </div>
        </div>
        {verdict && (
          <p className="mt-4 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
            {verdict}
          </p>
        )}
        <Link
          href={
            toRoom({
              agentId: "octo",
              question: `My schedule edge is ${delta.toFixed(1)} PPG — should I push for playoffs or sell?`,
              panelSlug: "strength-of-schedule",
            }) as Route
          }
          className="mt-4 inline-block text-sm text-orange underline"
        >
          ask Octo about your slate →
        </Link>
      </section>

      <footer className="flex flex-wrap items-center gap-4 text-sm">
        <Link href={`/league/${leagueId}/power-rankings` as Route} className="text-orange underline">
          power rankings →
        </Link>
        <Link href={`/league/${leagueId}/monte-carlo` as Route} className="text-orange underline">
          monte carlo →
        </Link>
      </footer>
    </div>
  );
}
