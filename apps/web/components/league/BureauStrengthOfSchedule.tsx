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
  const verdict = String(data.verdict ?? "Schedule tape still loading.");
  const leagueLabel = String(data.league_id ?? leagueId);
  const tone = scheduleTone(yourPpg, oppAvg);
  const gap = Math.round((yourPpg - oppAvg) * 10) / 10;
  const barYou = Math.min(100, Math.max(12, 40 + gap * 4));
  const barOpp = Math.min(100, Math.max(12, 40 - gap * 4));

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
              rest-of-season opponent power — not vibes, PPG-weighted
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Schedule / SOS
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          league {leagueLabel}
          {yourRank != null ? ` · you rank #${yourRank} on power` : ""}
        </p>
      </header>

      <section className="chunky bg-bg-card p-4">
        <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
          slate lens · {tone.label}
        </p>
        <p className="mt-2 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
          {verdict}
        </p>
        <div className="mt-4 flex flex-col gap-3">
          <div>
            <p className="text-xs font-bold uppercase" style={{ fontFamily: "var(--font-mono)" }}>
              your scoring ({yourPpg} PPG)
            </p>
            <div
              className="mt-1 h-4 border-2 border-ink"
              style={{ width: `${barYou}%`, background: "var(--pos-qb)" }}
            />
          </div>
          <div>
            <p className="text-xs font-bold uppercase" style={{ fontFamily: "var(--font-mono)" }}>
              avg opponent ({oppAvg} PPG)
            </p>
            <div
              className="mt-1 h-4 border-2 border-ink"
              style={{ width: `${barOpp}%`, background: tone.color }}
            />
          </div>
        </div>
        <p className="mt-3 text-sm font-bold" style={{ fontFamily: "var(--font-mono)", color: tone.color }}>
          {gap > 0 ? "+" : ""}
          {gap} PPG vs league-average opponent
        </p>
        <Link
          href={
            toRoom({
              agentId: "octo",
              question: `My schedule rates "${tone.label}" at ${gap} PPG vs the league. What trades hedge a brutal slate?`,
              panelSlug: "schedule",
            }) as Route
          }
          className="mt-3 inline-block text-sm text-orange underline"
        >
          ask Octo about your path →
        </Link>
      </section>

      <section className="chunky bg-bg-card p-4">
        <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
          how to read this
        </p>
        <ul className="mt-2 list-inside list-disc text-sm text-ink-medium" style={{ fontFamily: "var(--font-mono)" }}>
          <li>Uses the same power model as Power Rankings for remaining opponents.</li>
          <li>Connect Sleeper so we know which roster is yours.</li>
          <li>Pair with Waiver Tendencies when you need to stream into a soft week.</li>
        </ul>
      </section>
    </div>
  );
}
