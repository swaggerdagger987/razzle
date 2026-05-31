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
  const delta = yourPpg - oppPpg;
  if (delta >= 8) return "var(--green)";
  if (delta >= 0) return "var(--orange)";
  if (delta >= -8) return "var(--pos-wr)";
  return "var(--red)";
}

function scheduleLabel(yourPpg: number, oppPpg: number): string {
  const delta = yourPpg - oppPpg;
  if (delta >= 8) return "Schedule tailwind";
  if (delta >= 0) return "Slight edge";
  if (delta >= -8) return "Grind slate";
  return "Brutal path";
}

export function BureauStrengthOfSchedule({ data, leagueId }: Props) {
  const octo = AGENT_BY_ID.octo;
  const err = data.error as string | undefined;
  const yourRank = data.your_rank as number | undefined;
  const yourPpg = Number(data.your_ppg ?? 0);
  const oppPpg = Number(data.opponent_avg_ppg ?? 0);
  const verdict = String(data.verdict ?? "");
  const leagueLabel = String(data.league_id ?? leagueId);
  const delta = yourPpg - oppPpg;
  const color = scheduleColor(yourPpg, oppPpg);
  const barYou = Math.min(100, Math.max(12, 40 + delta * 2));
  const barOpp = Math.min(100, Math.max(12, 40 - delta * 2));

  if (err) {
    return (
      <p className="text-ink-medium text-sm" style={{ fontFamily: "var(--font-mono)" }}>
        {err}
      </p>
    );
  }

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
              your scoring vs the league&apos;s average opponent — rest-of-season lens
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Schedule / SOS
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          league {leagueLabel}
          {yourRank != null ? ` · power rank #${yourRank}` : ""}
        </p>
      </header>

      <section className="chunky bg-bg-card p-4">
        <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
          matchup tape
        </p>
        <p
          className="mt-2 text-lg font-bold uppercase"
          style={{ fontFamily: "var(--font-display)", color }}
        >
          {scheduleLabel(yourPpg, oppPpg)}
        </p>
        <div className="mt-4 flex flex-col gap-4">
          <div>
            <div className="mb-1 flex justify-between text-xs" style={{ fontFamily: "var(--font-mono)" }}>
              <span>your PPG</span>
              <span className="font-bold">{yourPpg.toFixed(1)}</span>
            </div>
            <div className="pressure-bar-track">
              <div className="pressure-bar-fill" style={{ width: `${barYou}%`, background: color }} />
            </div>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-xs" style={{ fontFamily: "var(--font-mono)" }}>
              <span>avg opponent PPG</span>
              <span className="font-bold">{oppPpg.toFixed(1)}</span>
            </div>
            <div className="pressure-bar-track">
              <div
                className="pressure-bar-fill"
                style={{ width: `${barOpp}%`, background: "var(--ink-medium)" }}
              />
            </div>
          </div>
        </div>
        <p className="text-ink-medium mt-4 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
          {delta > 0 ? "+" : ""}
          {delta.toFixed(1)} PPG vs league average opponent
        </p>
      </section>

      {verdict && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            octo verdict
          </p>
          <p className="mt-2 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
            {verdict}
          </p>
          <Link
            href={
              toRoom({
                agentId: "octo",
                question: `My team scores ${yourPpg} PPG vs a ${oppPpg} opponent average — how should I attack the rest of the season?`,
                panelSlug: "schedule",
              }) as Route
            }
            className="mt-3 inline-block text-sm text-orange underline"
          >
            ask Octo about your path →
          </Link>
        </section>
      )}
    </div>
  );
}
