"use client";

import { AGENT_BY_ID } from "@razzle/agents";
import { toRoom } from "@razzle/hallway";
import Link from "next/link";
import type { Route } from "next";

interface Props {
  data: Record<string, unknown>;
  leagueId: string;
}

function slateColor(yourPpg: number, oppPpg: number): string {
  const gap = yourPpg - oppPpg;
  if (gap >= 8) return "var(--green)";
  if (gap >= 0) return "var(--orange)";
  if (gap >= -8) return "var(--pos-wr)";
  return "var(--red)";
}

export function BureauStrengthOfSchedule({ data, leagueId }: Props) {
  const octo = AGENT_BY_ID.octo;
  const err = typeof data.error === "string" ? data.error : null;
  const yourRank = data.your_rank as number | undefined;
  const yourPpg = Number(data.your_ppg ?? 0);
  const oppPpg = Number(data.opponent_avg_ppg ?? 0);
  const verdict = String(data.verdict ?? "");
  const gap = yourPpg - oppPpg;
  const color = slateColor(yourPpg, oppPpg);
  const barWidth = Math.min(100, Math.max(12, 50 + gap * 3));

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
              rest-of-season slate vs league scoring power — not vibes
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Strength of Schedule
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          your roster vs average opponent PPG
        </p>
      </header>

      {err ? (
        <p className="chunky bg-bg-card p-4 text-sm text-red">something fumbled: {err}</p>
      ) : (
        <>
          <section className="chunky bg-bg-card p-4">
            <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
              slate verdict
            </p>
            <p className="mt-2 text-lg font-bold" style={{ fontFamily: "var(--font-display)", color }}>
              {verdict || "pulling the tape…"}
            </p>
            <p className="mt-2 text-sm text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
              you rank #{yourRank ?? "—"} at {yourPpg.toFixed(1)} PPG · league avg opponent {oppPpg.toFixed(1)}{" "}
              PPG ({gap > 0 ? "+" : ""}
              {gap.toFixed(1)} edge)
            </p>
            <div className="pressure-bar-row mt-4">
              <div className="pressure-bar-name">
                <span className="text-xs text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
                  your scoring vs avg opponent
                </span>
              </div>
              <div className="pressure-bar-track">
                <div className="pressure-bar-fill" style={{ width: `${barWidth}%`, background: color }} />
              </div>
            </div>
            <Link
              href={
                toRoom({
                  agentId: "octo",
                  question: `Is my rest-of-season schedule actually ${gap >= 0 ? "favorable" : "brutal"} at ${yourPpg.toFixed(1)} PPG?`,
                  panelSlug: "strength-of-schedule",
                }) as Route
              }
              className="mt-3 inline-block text-sm text-orange underline"
            >
              ask {octo.name} about your slate →
            </Link>
          </section>

          <section className="chunky bg-bg-card p-4">
            <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
              how we score the slate
            </p>
            <ul className="mt-2 flex flex-col gap-2 text-sm text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
              <li>+8 PPG vs league avg → easy road (green)</li>
              <li>even to +8 → winnable with average weeks</li>
              <li>-8 to 0 → tough — need ceiling games</li>
              <li>below -8 → brutal — every win is a sweat</li>
            </ul>
          </section>
        </>
      )}

      <footer className="flex flex-wrap gap-4 text-sm">
        <Link href={`/league/${leagueId}/power-rankings` as Route} className="text-orange underline">
          power rankings →
        </Link>
        <Link href={`/league/${leagueId}/monte-carlo` as Route} className="text-orange underline">
          monte carlo →
        </Link>
        <Link href={`/league/${leagueId}/self-scout` as Route} className="text-orange underline">
          self-scout →
        </Link>
      </footer>
    </div>
  );
}
