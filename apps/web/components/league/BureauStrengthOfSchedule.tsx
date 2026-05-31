"use client";

import { AGENT_BY_ID } from "@razzle/agents";
import { toRoom } from "@razzle/hallway";
import Link from "next/link";
import type { Route } from "next";

interface Props {
  data: Record<string, unknown>;
  leagueId: string;
}

function scheduleTone(yourPpg: number, oppAvg: number): { label: string; color: string } {
  const gap = yourPpg - oppAvg;
  if (gap >= 8) return { label: "soft landing", color: "var(--green)" };
  if (gap >= 0) return { label: "playable path", color: "var(--orange)" };
  if (gap >= -8) return { label: "grind mode", color: "var(--pos-wr)" };
  return { label: "brutal slate", color: "var(--red)" };
}

export function BureauStrengthOfSchedule({ data, leagueId }: Props) {
  const octo = AGENT_BY_ID.octo;
  const yourRank = data.your_rank as number | undefined;
  const yourPpg = Number(data.your_ppg ?? 0);
  const oppAvg = Number(data.opponent_avg_ppg ?? 0);
  const verdict = String(data.verdict ?? "pulling the rest-of-season tape…");
  const leagueLabel = String(data.league_id ?? leagueId);
  const gap = Math.round((yourPpg - oppAvg) * 10) / 10;
  const tone = scheduleTone(yourPpg, oppAvg);
  const youBar = Math.min(100, Math.max(12, 40 + gap * 4));
  const oppBar = Math.min(100, Math.max(12, 40 - gap * 4));

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
              rest-of-season opponent power — not vibes, average foe PPG
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Strength of Schedule
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          league {leagueLabel}
          {yourRank != null ? ` · you rank #${yourRank} on power` : ""}
        </p>
      </header>

      <section className="chunky bg-bg-card p-6">
        <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
          schedule verdict · {tone.label}
        </p>
        <p className="mt-2 text-lg" style={{ fontFamily: "var(--font-hand)" }}>
          {verdict}
        </p>
        <Link
          href={
            toRoom({
              agentId: "octo",
              question: `My rest-of-season schedule reads "${verdict}" — what trade moves fit this slate?`,
              panelSlug: "schedule",
            }) as Route
          }
          className="mt-4 inline-block text-sm text-orange underline"
        >
          ask Octo about your path →
        </Link>
      </section>

      <section className="chunky bg-bg-card p-4">
        <p className="mb-4 text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
          you vs league-average opponent
        </p>
        <div className="flex flex-col gap-4">
          <div>
            <div className="mb-1 flex justify-between text-sm" style={{ fontFamily: "var(--font-mono)" }}>
              <span>your scoring ({yourPpg} PPG)</span>
              <span style={{ color: tone.color }}>{gap > 0 ? "+" : ""}{gap} vs avg foe</span>
            </div>
            <div className="h-4 border-2 border-ink bg-bg">
              <div className="h-full" style={{ width: `${youBar}%`, background: "var(--pos-qb)" }} />
            </div>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-sm" style={{ fontFamily: "var(--font-mono)" }}>
              <span>avg opponent allowed ({oppAvg} PPG)</span>
              <span className="text-ink-light">league-wide mean</span>
            </div>
            <div className="h-4 border-2 border-ink bg-bg">
              <div className="h-full" style={{ width: `${oppBar}%`, background: "var(--pos-te)" }} />
            </div>
          </div>
        </div>
        <p className="text-ink-medium mt-4 text-xs" style={{ fontFamily: "var(--font-hand)" }}>
          Octo weights every other roster&apos;s power rank into one opponent average — dynasty
          playoff paths live or die on this gap.
        </p>
      </section>

      {yourRank != null && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            power context
          </p>
          <p className="mt-2 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
            You sit #{yourRank} on the bureau power board while the league averages {oppAvg} PPG
            against you. Pair with Power Rankings when negotiating win-now trades.
          </p>
          <Link
            href={`/league/${leagueId}/power-rankings` as Route}
            className="mt-3 inline-block text-sm text-orange underline"
          >
            open power rankings →
          </Link>
        </section>
      )}
    </div>
  );
}
