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
  return "var(--red)";
}

export function BureauStrengthOfSchedule({ data, leagueId }: Props) {
  const octo = AGENT_BY_ID.octo;
  const yourRank = data.your_rank as number | undefined;
  const yourPpg = Number(data.your_ppg ?? 0);
  const oppAvg = Number(data.opponent_avg_ppg ?? 0);
  const verdict = String(data.verdict ?? "");
  const gap = yourPpg - oppAvg;
  const color = slateColor(yourPpg, oppAvg);
  const barWidth = Math.min(100, Math.max(12, 50 + gap * 4));

  if (data.error) {
    return (
      <p className="text-ink-medium text-sm" style={{ fontFamily: "var(--font-mono)" }}>
        {String(data.error)} — connect Sleeper and pick your roster.
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
              how brutal your remaining opponents look on paper
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Strength of Schedule
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          league {String(data.league_id ?? leagueId)}
          {yourRank != null ? ` · power rank #${yourRank}` : ""}
        </p>
      </header>

      <section className="chunky bg-bg-card p-4">
        <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
          your slate
        </p>
        <p className="mt-2 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
          {verdict || "pulling the rest-of-season tape…"}
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex justify-between text-xs" style={{ fontFamily: "var(--font-mono)" }}>
            <span>your scoring ({yourPpg.toFixed(1)} PPG)</span>
            <span>avg opponent ({oppAvg.toFixed(1)} PPG)</span>
          </div>
          <div
            className="pressure-bar-fill"
            style={{ width: `${barWidth}%`, background: color, border: "3px solid var(--ink)" }}
          />
          <p className="text-xs text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            gap {gap > 0 ? "+" : ""}
            {gap.toFixed(1)} PPG vs league average opponent
          </p>
        </div>
        <Link
          href={
            toRoom({
              agentId: "octo",
              question: `My schedule rates "${verdict}" — should I sell win-now pieces or push for playoffs?`,
              panelSlug: "strength-of-schedule",
            }) as Route
          }
          className="mt-4 inline-block text-sm text-orange underline"
        >
          ask Octo about your slate →
        </Link>
      </section>

      <section className="chunky bg-bg-card p-4">
        <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
          how we score the slate
        </p>
        <ul className="mt-2 flex flex-col gap-2 text-sm text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
          <li>compares your PPG to the average scoring power of every other roster</li>
          <li>easy road = you outpace the league by 8+ PPG on average</li>
          <li>brutal = you trail the average opponent by 8+ PPG — ceiling weeks required</li>
        </ul>
      </section>

      <footer className="flex flex-wrap gap-4 text-sm">
        <Link href={`/league/${leagueId}/power-rankings` as Route} className="text-orange underline">
          full power board →
        </Link>
        <Link href={`/league/${leagueId}/monte-carlo` as Route} className="text-orange underline">
          playoff odds sim →
        </Link>
        <Link href={`/league/${leagueId}/self-scout` as Route} className="text-orange underline">
          roster grades →
        </Link>
      </footer>
    </div>
  );
}
