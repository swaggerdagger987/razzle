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
  const yourPpg = data.your_ppg != null ? Number(data.your_ppg) : null;
  const oppAvg = data.opponent_avg_ppg != null ? Number(data.opponent_avg_ppg) : null;
  const verdict = String(data.verdict ?? "");
  const diff = yourPpg != null && oppAvg != null ? yourPpg - oppAvg : null;
  const diffColor =
    diff == null ? "var(--ink-medium)" : diff >= 8 ? "var(--green)" : diff >= 0 ? "var(--orange)" : "var(--red)";

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
              remaining slate vs league scoring power — not vibes
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Strength of Schedule
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          your power rank vs average opponent PPG
        </p>
      </header>

      {yourRank != null && yourPpg != null && oppAvg != null && (
        <section className="chunky bg-bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
                your power rank
              </p>
              <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                #{yourRank}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
                your PPG
              </p>
              <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                {yourPpg}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
                avg opp PPG
              </p>
              <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                {oppAvg}
              </p>
            </div>
          </div>
          {diff != null && (
            <div className="mt-4">
              <div className="pressure-bar-track">
                <div
                  className="pressure-bar-fill"
                  style={{
                    width: `${Math.min(100, Math.max(12, 50 + diff * 3))}%`,
                    background: diffColor,
                  }}
                />
              </div>
              <p className="mt-2 text-sm" style={{ fontFamily: "var(--font-mono)", color: diffColor }}>
                {diff > 0 ? "+" : ""}
                {diff.toFixed(1)} PPG vs league average opponent
              </p>
            </div>
          )}
          <p className="mt-4 text-sm text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
            {verdict}
          </p>
          <Link
            href={
              toRoom({
                agentId: "octo",
                question: `My schedule verdict is "${verdict}" — what matchups should I prioritize?`,
                panelSlug: "strength-of-schedule",
              }) as Route
            }
            className="mt-3 inline-block text-sm text-orange underline"
          >
            ask Octo about your slate →
          </Link>
        </section>
      )}

      {yourRank == null && (
        <p className="text-ink-medium text-sm">connect Sleeper with your user linked to see schedule strength.</p>
      )}

      <footer className="flex flex-wrap gap-4 text-sm">
        <Link href={`/league/${leagueId}/power-rankings` as Route} className="text-orange underline">
          full power rankings →
        </Link>
        <Link href={`/league/${leagueId}/self-scout` as Route} className="text-orange underline">
          self-scout your roster →
        </Link>
      </footer>
    </div>
  );
}
