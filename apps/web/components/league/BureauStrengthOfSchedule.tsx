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
  const yourRank = data.your_rank as number | undefined;
  const yourPpg = Number(data.your_ppg ?? 0);
  const oppPpg = Number(data.opponent_avg_ppg ?? 0);
  const verdict = String(data.verdict ?? "Schedule data still pulling film...");
  const delta = Math.round((yourPpg - oppPpg) * 10) / 10;
  const barPct = Math.min(100, Math.max(0, 50 + delta * 3));

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
              remaining opponent power vs your scoring pace
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Strength of Schedule
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          power rank #{yourRank ?? "—"} · you {yourPpg.toFixed(1)} PPG vs league avg {oppPpg.toFixed(1)}
        </p>
      </header>

      <section className="chunky bg-bg-card p-6">
        <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
          schedule verdict
        </p>
        <p className="mt-2 text-lg" style={{ fontFamily: "var(--font-hand)" }}>
          {verdict}
        </p>
        <div className="mt-4">
          <div
            className="h-4 w-full border-2 border-ink"
            style={{ background: "var(--bg)" }}
            role="presentation"
          >
            <div
              className="h-full"
              style={{
                width: `${barPct}%`,
                background: delta >= 0 ? "var(--green)" : "var(--red)",
              }}
            />
          </div>
          <p className="text-ink-light mt-2 text-xs" style={{ fontFamily: "var(--font-mono)" }}>
            {delta >= 0 ? "+" : ""}
            {delta} PPG vs average opponent
          </p>
        </div>
        <Link
          href={
            toRoom({
              agentId: "octo",
              question: `My schedule rates "${verdict}" — should I push win-now trades or tank for picks?`,
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
