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

export function BureauStrengthOfSchedule({ data, leagueId }: Props) {
  const octo = AGENT_BY_ID.octo;
  const yourRank = data.your_rank as number | undefined;
  const yourPpg = Number(data.your_ppg ?? 0);
  const oppPpg = Number(data.opponent_avg_ppg ?? 0);
  const verdict = String(data.verdict ?? "pulling the rest-of-season tape...");
  const diff = yourPpg - oppPpg;
  const color = scheduleColor(yourPpg, oppPpg);
  const barWidth = Math.min(100, Math.max(12, 50 + diff * 3));

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
              rest-of-season opponent power — not vibes, points allowed
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Strength of Schedule
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {yourRank != null ? `you rank #${yourRank} on power` : "connect your roster"} · avg opponent {oppPpg} PPG
        </p>
      </header>

      <section className="chunky bg-bg-card p-6">
        <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
          your scoring vs league average opponent
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-6">
          <div>
            <p className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)", color }}>
              {yourPpg.toFixed(1)}
            </p>
            <p className="text-xs text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
              your PPG
            </p>
          </div>
          <p className="text-2xl text-ink-light">vs</p>
          <div>
            <p className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
              {oppPpg.toFixed(1)}
            </p>
            <p className="text-xs text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
              avg opponent PPG
            </p>
          </div>
        </div>
        <div className="pressure-bar-track mt-6">
          <div className="pressure-bar-fill" style={{ width: `${barWidth}%`, background: color }} aria-hidden />
        </div>
        <p className="mt-4 text-sm text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
          {verdict}
        </p>
        <Link
          href={
            toRoom({
              agentId: "octo",
              question: `My schedule rates ${diff >= 0 ? "favorable" : "brutal"} — what matchups should I target?`,
              panelSlug: "strength-of-schedule",
            }) as Route
          }
          className="mt-4 inline-block text-sm text-orange underline"
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
