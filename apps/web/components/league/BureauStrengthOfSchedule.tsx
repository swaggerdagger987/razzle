"use client";

import { AGENT_BY_ID } from "@razzle/agents";
import { toRoom } from "@razzle/hallway";
import Link from "next/link";
import type { Route } from "next";

interface Props {
  data: Record<string, unknown>;
  leagueId: string;
}

function ppgDelta(yourPpg: number, oppAvg: number): { label: string; color: string } {
  const delta = yourPpg - oppAvg;
  if (delta >= 8) return { label: `+${delta.toFixed(1)} PPG cushion`, color: "var(--pos-rb)" };
  if (delta >= 0) return { label: `+${delta.toFixed(1)} PPG vs league avg`, color: "var(--pos-wr)" };
  if (delta >= -8) return { label: `${delta.toFixed(1)} PPG vs league avg`, color: "var(--orange)" };
  return { label: `${delta.toFixed(1)} PPG vs league avg`, color: "var(--pos-te)" };
}

export function BureauStrengthOfSchedule({ data, leagueId }: Props) {
  const octo = AGENT_BY_ID.octo;
  const yourRank = data.your_rank as number | undefined;
  const yourPpg = Number(data.your_ppg ?? 0);
  const oppAvg = Number(data.opponent_avg_ppg ?? 0);
  const verdict = String(data.verdict ?? "Schedule read pending.");
  const leagueLabel = String(data.league_id ?? leagueId);
  const delta = ppgDelta(yourPpg, oppAvg);
  const rankLabel = yourRank != null ? `#${yourRank}` : "—";

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
              rest-of-season slate — how tough your remaining opponents look on paper
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Strength of Schedule
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          league {leagueLabel} · power-ranked opponent pool
        </p>
      </header>

      <section className="chunky bg-bg-card p-6" style={{ transform: "rotate(-0.25deg)" }}>
        <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
          slate verdict
        </p>
        <p className="mt-2 text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          {verdict}
        </p>
        <Link
          href={
            toRoom({
              agentId: "octo",
              question: `How should I plan trades given this schedule read: ${verdict}`,
              panelSlug: "strength-of-schedule",
            }) as Route
          }
          className="mt-4 inline-block text-sm text-orange underline"
        >
          ask Octo about your slate →
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            your power rank
          </p>
          <p className="mt-1 text-3xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--pos-qb)" }}>
            {rankLabel}
          </p>
        </div>
        <div className="chunky bg-bg-card p-4" style={{ transform: "rotate(0.35deg)" }}>
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            your PPG
          </p>
          <p className="mt-1 text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            {yourPpg.toFixed(1)}
          </p>
        </div>
        <div className="chunky bg-bg-card p-4" style={{ transform: "rotate(-0.35deg)" }}>
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            avg opponent PPG
          </p>
          <p className="mt-1 text-3xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--orange)" }}>
            {oppAvg.toFixed(1)}
          </p>
        </div>
      </section>

      <section className="chunky bg-bg-card p-4">
        <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
          pace vs league
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span
            className="text-sm font-bold uppercase"
            style={{
              fontFamily: "var(--font-mono)",
              color: delta.color,
              border: "3px solid var(--ink)",
              padding: "0.25rem 0.5rem",
              background: "var(--bg)",
              transform: "rotate(-2deg)",
            }}
          >
            {delta.label}
          </span>
          <div className="flex-1 min-w-[12rem]">
            <div className="h-4 border-[3px] border-ink bg-bg-warm">
              <div
                className="h-full bg-orange"
                style={{
                  width: `${Math.min(100, Math.max(8, (yourPpg / Math.max(oppAvg, 1)) * 50))}%`,
                }}
              />
            </div>
            <p className="mt-1 text-[10px] text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
              you vs league-average opponent scoring
            </p>
          </div>
        </div>
      </section>

      <footer className="flex flex-wrap gap-4 text-sm">
        <Link href={`/league/${leagueId}/power-rankings` as Route} className="text-orange underline">
          full power rankings →
        </Link>
        <Link href={`/lab/schedule` as Route} className="text-orange underline">
          schedule panel →
        </Link>
        <Link href={`/league/${leagueId}/monte-carlo` as Route} className="text-orange underline">
          playoff odds →
        </Link>
      </footer>
    </div>
  );
}
