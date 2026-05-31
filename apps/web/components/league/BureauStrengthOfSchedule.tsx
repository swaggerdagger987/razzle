"use client";

import { AGENT_BY_ID } from "@razzle/agents";
import { toRoom } from "@razzle/hallway";
import Link from "next/link";
import type { Route } from "next";

interface Props {
  data: Record<string, unknown>;
  leagueId: string;
}

function scheduleColor(yourPpg: number, oppAvg: number): string {
  const gap = yourPpg - oppAvg;
  if (gap >= 8) return "var(--green)";
  if (gap >= 0) return "var(--orange)";
  if (gap >= -8) return "var(--pos-wr)";
  return "var(--red)";
}

export function BureauStrengthOfSchedule({ data, leagueId }: Props) {
  const octo = AGENT_BY_ID.octo;
  const error = typeof data.error === "string" ? data.error : null;
  const yourRank = data.your_rank as number | undefined;
  const yourPpg = Number(data.your_ppg ?? 0);
  const oppAvg = Number(data.opponent_avg_ppg ?? 0);
  const verdict = (data.verdict as string) ?? "Connect a league to read your remaining slate.";
  const gap = yourPpg - oppAvg;
  const color = scheduleColor(yourPpg, oppAvg);
  const youBar = Math.min(100, Math.max(12, 40 + gap * 2));
  const oppBar = Math.min(100, Math.max(12, 40 - gap * 2));

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
              rest-of-season opponent power — are you on an easy road or a gauntlet?
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Strength of Schedule
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {yourRank != null ? `your power rank #${yourRank}` : "your roster"} · league avg opponent {oppAvg} PPG
        </p>
      </header>

      {error ? (
        <p className="text-ink-medium text-sm">{error} — connect Sleeper and pick your team.</p>
      ) : (
        <>
          <section className="chunky bg-bg-card p-4">
            <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
              slate verdict
            </p>
            <p className="mt-2 text-sm" style={{ fontFamily: "var(--font-hand)", color }}>
              {verdict}
            </p>
            <Link
              href={
                toRoom({
                  agentId: "octo",
                  question: `My league schedule verdict is "${verdict}" — what roster moves fit this slate?`,
                  panelSlug: "strength-of-schedule",
                }) as Route
              }
              className="mt-3 inline-block text-sm text-orange underline"
            >
              ask Octo about your schedule →
            </Link>
          </section>

          <section className="chunky bg-bg-card p-4">
            <p className="mb-4 text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
              you vs average opponent
            </p>
            <div className="mb-4">
              <div className="mb-1 flex justify-between text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                <span>your scoring ({yourPpg} PPG)</span>
                <span style={{ color }}>{gap > 0 ? "+" : ""}{gap.toFixed(1)} edge</span>
              </div>
              <div className="pressure-bar-track">
                <div className="pressure-bar-fill" style={{ width: `${youBar}%`, background: color }} />
              </div>
            </div>
            <div>
              <div className="mb-1 text-xs text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
                avg opponent power ({oppAvg} PPG)
              </div>
              <div className="pressure-bar-track">
                <div
                  className="pressure-bar-fill"
                  style={{ width: `${oppBar}%`, background: "var(--ink-medium)" }}
                />
              </div>
            </div>
            <p className="text-ink-medium mt-4 text-xs" style={{ fontFamily: "var(--font-hand)" }}>
              Based on league power rankings — full matchup-week SOS lands in a follow-up.
            </p>
          </section>
        </>
      )}

      <footer className="flex flex-wrap items-center gap-4 text-sm">
        <Link href={`/league/${leagueId}/power-rankings` as Route} className="text-orange underline">
          power rankings →
        </Link>
        <Link href={`/league/${leagueId}/monte-carlo` as Route} className="text-orange underline">
          monte carlo →
        </Link>
        <Link href={`/league/${leagueId}/waiver-tendencies` as Route} className="text-orange underline">
          waiver tendencies →
        </Link>
        <Link href={"/lab/schedule" as Route} className="text-orange underline">
          schedule panel →
        </Link>
      </footer>
    </div>
  );
}
