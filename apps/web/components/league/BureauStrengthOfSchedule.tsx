"use client";

import { AGENT_BY_ID } from "@razzle/agents";
import { toRoom } from "@razzle/hallway";
import Link from "next/link";
import type { Route } from "next";

interface Props {
  data: Record<string, unknown>;
  leagueId: string;
}

function barWidth(value: number, max: number): string {
  if (max <= 0) return "0%";
  return `${Math.min(100, Math.round((value / max) * 100))}%`;
}

function verdictTone(verdict: string): string {
  if (verdict.toLowerCase().includes("brutal")) return "var(--red)";
  if (verdict.toLowerCase().includes("easy")) return "var(--green)";
  if (verdict.toLowerCase().includes("tough")) return "var(--pos-wr)";
  return "var(--orange)";
}

export function BureauStrengthOfSchedule({ data, leagueId }: Props) {
  const octo = AGENT_BY_ID.octo;
  const yourPpg = Number(data.your_ppg ?? 0);
  const oppAvg = Number(data.opponent_avg_ppg ?? 0);
  const yourRank = data.your_rank != null ? Number(data.your_rank) : null;
  const verdict = String(data.verdict ?? "Schedule tape loading…");
  const userId = String(data.user_id ?? "");
  const leagueLabel = String(data.league_id ?? leagueId);
  const delta = Math.round((yourPpg - oppAvg) * 10) / 10;
  const maxBar = Math.max(yourPpg, oppAvg, 1);

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
              rest-of-season matchup power — your scoring vs the league&apos;s average opponent
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Strength of Schedule
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          league {leagueLabel}
          {yourRank != null ? ` · power rank #${yourRank}` : ""}
        </p>
      </header>

      <section
        className="chunky bg-bg-card p-6"
        style={{ borderColor: verdictTone(verdict) }}
      >
        <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
          slate verdict
        </p>
        <p
          className="mt-2 text-xl font-bold"
          style={{ fontFamily: "var(--font-display)", color: verdictTone(verdict) }}
        >
          {verdict}
        </p>
        <p className="text-ink-medium mt-2 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {delta >= 0 ? "+" : ""}
          {delta} PPG vs league-average opponent scoring
        </p>
      </section>

      <section className="chunky bg-bg-card p-6">
        <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
          matchup power bars
        </p>
        <div className="mt-4 flex flex-col gap-4">
          <div>
            <div className="mb-1 flex justify-between text-sm" style={{ fontFamily: "var(--font-mono)" }}>
              <span>Your scoring (PPG)</span>
              <span className="font-bold">{yourPpg}</span>
            </div>
            <div className="h-4 border-2 border-ink bg-bg" style={{ boxShadow: "3px 3px 0 var(--ink)" }}>
              <div
                className="h-full bg-orange"
                style={{ width: barWidth(yourPpg, maxBar) }}
              />
            </div>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-sm" style={{ fontFamily: "var(--font-mono)" }}>
              <span>Avg opponent PPG (league)</span>
              <span className="font-bold">{oppAvg}</span>
            </div>
            <div className="h-4 border-2 border-ink bg-bg" style={{ boxShadow: "3px 3px 0 var(--ink)" }}>
              <div
                className="h-full"
                style={{ width: barWidth(oppAvg, maxBar), background: "var(--pos-qb)" }}
              />
            </div>
          </div>
        </div>
        <Link
          href={
            toRoom({
              agentId: "octo",
              question: `My schedule verdict is "${verdict}" — should I sell win-now pieces or buy for playoffs?`,
              panelSlug: "strength-of-schedule",
            }) as Route
          }
          className="mt-4 inline-block text-sm text-orange underline"
        >
          ask Octo about your slate →
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="chunky bg-bg-card p-4" style={{ transform: "rotate(-0.5deg)" }}>
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            your PPG
          </p>
          <p className="text-3xl font-bold text-orange" style={{ fontFamily: "var(--font-display)" }}>
            {yourPpg}
          </p>
        </div>
        <div className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            opp avg PPG
          </p>
          <p className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--pos-qb)" }}>
            {oppAvg}
          </p>
        </div>
        <div className="chunky bg-bg-card p-4" style={{ transform: "rotate(0.5deg)" }}>
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            power rank
          </p>
          <p className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            {yourRank != null ? `#${yourRank}` : "—"}
          </p>
        </div>
      </section>

      {userId && (
        <p className="text-xs text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
          sleeper user {userId.slice(0, 8)}…
        </p>
      )}

      <footer className="flex flex-wrap gap-4 text-sm">
        <Link href={`/league/${leagueId}/power-rankings` as Route} className="text-orange underline">
          full league power board →
        </Link>
        <Link href={`/league/${leagueId}/monte-carlo` as Route} className="text-orange underline">
          monte carlo playoff odds →
        </Link>
        <Link href={`/league/${leagueId}/build-profiles` as Route} className="text-orange underline">
          roster build archetypes →
        </Link>
      </footer>
    </div>
  );
}
