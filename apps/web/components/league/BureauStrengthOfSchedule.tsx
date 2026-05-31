"use client";

import { AGENT_BY_ID } from "@razzle/agents";
import { toRoom } from "@razzle/hallway";
import Link from "next/link";
import type { Route } from "next";

interface Props {
  data: Record<string, unknown>;
  leagueId: string;
}

function slateColor(yourPpg: number, oppAvg: number): string {
  const gap = yourPpg - oppAvg;
  if (gap >= 8) return "var(--green)";
  if (gap >= 0) return "var(--orange)";
  if (gap >= -8) return "var(--teal)";
  return "var(--red)";
}

export function BureauStrengthOfSchedule({ data, leagueId }: Props) {
  const octo = AGENT_BY_ID.octo;
  const err = typeof data.error === "string" ? data.error : null;
  const yourRank = data.your_rank as number | undefined;
  const yourPpg = Number(data.your_ppg ?? 0);
  const oppAvg = Number(data.opponent_avg_ppg ?? 0);
  const verdict = String(data.verdict ?? "");
  const gap = yourPpg - oppAvg;
  const color = slateColor(yourPpg, oppAvg);
  const youBar = Math.min(100, Math.max(12, 50 + gap * 2));
  const oppBar = Math.min(100, Math.max(12, 50 - gap * 2));

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
              rest-of-season opponent power — not vibes, league PPG tape
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Strength of Schedule
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          your scoring vs average opponent PPG in this league
        </p>
      </header>

      {err ? (
        <section className="chunky bg-bg-card p-4">
          <p className="text-red text-sm">something fumbled: {err}</p>
        </section>
      ) : (
        <>
          <section className="chunky bg-bg-card p-4">
            <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
              slate verdict
            </p>
            <p className="mt-2 text-lg" style={{ fontFamily: "var(--font-display)", color }}>
              {verdict || "pulling the schedule tape…"}
            </p>
            {yourRank != null && (
              <p className="text-ink-medium mt-2 text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                you rank #{yourRank} on power · {yourPpg} PPG vs {oppAvg} avg opponent
              </p>
            )}
            <Link
              href={
                toRoom({
                  agentId: "octo",
                  question: `How should I plan trades given this SOS verdict: ${verdict}?`,
                  panelSlug: "schedule",
                }) as Route
              }
              className="mt-3 inline-block text-sm text-orange underline"
            >
              ask {octo.name} about the slate →
            </Link>
          </section>

          <section className="chunky bg-bg-card p-4">
            <p className="mb-4 text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
              you vs league average opponent
            </p>
            <div className="flex flex-col gap-4">
              <div>
                <div className="mb-1 flex justify-between text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                  <span>your PPG</span>
                  <span>{yourPpg}</span>
                </div>
                <div className="chunky bg-bg h-4 overflow-hidden">
                  <div className="h-full" style={{ width: `${youBar}%`, background: color }} />
                </div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                  <span>avg opponent PPG</span>
                  <span>{oppAvg}</span>
                </div>
                <div className="chunky bg-bg h-4 overflow-hidden">
                  <div
                    className="h-full bg-ink-light"
                    style={{ width: `${oppBar}%`, opacity: 0.85 }}
                  />
                </div>
              </div>
              <p className="text-ink-medium text-xs" style={{ fontFamily: "var(--font-hand)" }}>
                {gap >= 0
                  ? `+${gap.toFixed(1)} PPG cushion — you outscore the typical opponent you'd face.`
                  : `${gap.toFixed(1)} PPG deficit — schedule plays above your scoring pace.`}
              </p>
            </div>
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
      </footer>
    </div>
  );
}
