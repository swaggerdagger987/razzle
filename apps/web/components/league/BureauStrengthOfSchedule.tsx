"use client";

import { AGENT_BY_ID } from "@razzle/agents";
import { toRoom } from "@razzle/hallway";
import Link from "next/link";
import type { Route } from "next";

interface Props {
  data: Record<string, unknown>;
  leagueId: string;
}

function scheduleColor(yourPpg: number, oppPpg: number): string {
  const diff = yourPpg - oppPpg;
  if (diff >= 8) return "var(--green)";
  if (diff >= 0) return "var(--orange)";
  if (diff >= -8) return "var(--pos-wr)";
  return "var(--red)";
}

function compareWidth(yourPpg: number, oppPpg: number): number {
  const max = Math.max(yourPpg, oppPpg, 1);
  return Math.min(100, Math.max(12, Math.round((yourPpg / max) * 100)));
}

export function BureauStrengthOfSchedule({ data, leagueId }: Props) {
  const octo = AGENT_BY_ID.octo;
  const err = typeof data.error === "string" ? data.error : null;
  const yourRank = typeof data.your_rank === "number" ? data.your_rank : null;
  const yourPpg = typeof data.your_ppg === "number" ? data.your_ppg : null;
  const oppPpg = typeof data.opponent_avg_ppg === "number" ? data.opponent_avg_ppg : null;
  const verdict = typeof data.verdict === "string" ? data.verdict : null;
  const hasMetrics = yourPpg != null && oppPpg != null;
  const diff = hasMetrics ? yourPpg - oppPpg : 0;
  const color = hasMetrics ? scheduleColor(yourPpg, oppPpg) : "var(--ink-medium)";
  const width = hasMetrics ? compareWidth(yourPpg, oppPpg) : 50;

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
              how tough your remaining opponents look vs your scoring pace
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Strength of Schedule
        </h1>
        <p className="mt-1 text-sm text-ink-medium" style={{ fontFamily: "var(--font-mono)" }}>
          {yourRank != null ? `you rank #${yourRank} in power` : "connect a league roster to grade your slate"}
        </p>
      </header>

      {err && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-sm text-ink-medium">{err} — link a Sleeper league with your roster to see SOS.</p>
        </section>
      )}

      {verdict && !err && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            slate verdict
          </p>
          <p className="mt-2 text-lg" style={{ fontFamily: "var(--font-hand)", color }}>
            {verdict}
          </p>
          {hasMetrics && (
            <Link
              href={
                toRoom({
                  agentId: "octo",
                  question: `My team scores ${yourPpg} PPG but the league averages ${oppPpg} against me — what matchups should I target?`,
                  panelSlug: "strength-of-schedule",
                }) as Route
              }
              className="mt-3 inline-block text-sm text-orange underline"
            >
              ask Octo about your schedule →
            </Link>
          )}
        </section>
      )}

      {hasMetrics && !err && (
        <section className="chunky bg-bg-card p-4">
          <p className="mb-4 text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            you vs league average opponent
          </p>
          <ul className="flex flex-col gap-4">
            <li className="pressure-bar-row">
              <div className="pressure-bar-name">
                <span className="font-bold" style={{ fontFamily: "var(--font-display)" }}>
                  your PPG
                </span>
                <span className="text-xs text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
                  {" "}
                  {yourPpg.toFixed(1)}
                </span>
              </div>
              <div className="pressure-bar-track">
                <div className="pressure-bar-fill" style={{ width: `${width}%`, background: color }} />
              </div>
              <span className="pressure-bar-tag text-xs" style={{ color, borderColor: color }}>
                {diff >= 0 ? "+" : ""}
                {diff.toFixed(1)} vs avg opp
              </span>
            </li>
            <li className="pressure-bar-row">
              <div className="pressure-bar-name">
                <span className="font-bold" style={{ fontFamily: "var(--font-display)" }}>
                  avg opponent PPG
                </span>
                <span className="text-xs text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
                  {" "}
                  {oppPpg.toFixed(1)}
                </span>
              </div>
              <div className="pressure-bar-track">
                <div
                  className="pressure-bar-fill"
                  style={{
                    width: `${Math.min(100, Math.round((oppPpg / Math.max(yourPpg, oppPpg, 1)) * 100))}%`,
                    background: "var(--ink-light)",
                  }}
                />
              </div>
            </li>
          </ul>
          <p className="mt-4 text-xs text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            uses power-ranking PPG until weekly matchup feed ships (Phase 5.5)
          </p>
        </section>
      )}

      <footer className="text-xs text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
        league {leagueId.slice(0, 8)}… · remaining strength from opponent scoring pace
      </footer>
    </div>
  );
}
