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
  const delta = yourPpg - oppPpg;
  if (delta >= 8) return "var(--green)";
  if (delta >= 0) return "var(--orange)";
  if (delta >= -8) return "var(--pos-wr)";
  return "var(--red)";
}

export function BureauStrengthOfSchedule({ data, leagueId }: Props) {
  const octo = AGENT_BY_ID.octo;
  const err = typeof data.error === "string" ? data.error : null;
  const yourRank = data.your_rank as number | undefined;
  const yourPpg = Number(data.your_ppg ?? 0);
  const oppPpg = Number(data.opponent_avg_ppg ?? 0);
  const verdict = String(data.verdict ?? "");
  const delta = yourPpg - oppPpg;

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
              your scoring pace vs the average opponent left on the slate
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Strength of Schedule
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          power-ranked opponents · league {leagueId}
        </p>
      </header>

      {err && (
        <p className="text-red text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          something fumbled: {err}
        </p>
      )}

      {!err && (
        <>
          <section className="chunky bg-bg-card p-6">
            <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
              your slate
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
                  power rank
                </p>
                <p className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                  {yourRank != null ? `#${yourRank}` : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
                  your PPG
                </p>
                <p className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--pos-qb)" }}>
                  {yourPpg.toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-xs text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
                  avg opp PPG
                </p>
                <p className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--pos-te)" }}>
                  {oppPpg.toFixed(1)}
                </p>
              </div>
            </div>
            <p
              className="mt-4 text-sm font-bold"
              style={{ fontFamily: "var(--font-mono)", color: slateColor(yourPpg, oppPpg) }}
            >
              {delta >= 0 ? "+" : ""}
              {delta.toFixed(1)} PPG vs league average opponent
            </p>
          </section>

          {verdict && (
            <section
              className="chunky bg-bg-card p-4"
              style={{ transform: "rotate(-0.4deg)", borderColor: slateColor(yourPpg, oppPpg) }}
            >
              <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
                octo read
              </p>
              <p className="mt-2 text-sm text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
                {verdict}
              </p>
              <Link
                href={
                  toRoom({
                    agentId: "octo",
                    question: `How should I plan around a ${delta >= 0 ? "favorable" : "brutal"} remaining schedule?`,
                    panelSlug: "strength-of-schedule",
                  }) as Route
                }
                className="mt-3 inline-block text-sm text-orange underline"
              >
                ask {octo.name} →
              </Link>
            </section>
          )}
        </>
      )}

      <footer className="flex flex-wrap gap-4 text-sm">
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
