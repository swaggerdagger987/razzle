"use client";

import { AGENT_BY_ID } from "@razzle/agents";
import { toRoom } from "@razzle/hallway";
import Link from "next/link";
import type { Route } from "next";

interface Props {
  data: Record<string, unknown>;
  leagueId: string;
}

function scheduleTone(yourPpg: number, oppPpg: number): { label: string; color: string } {
  const delta = yourPpg - oppPpg;
  if (delta >= 8) return { label: "easy road", color: "var(--green)" };
  if (delta >= 0) return { label: "even slate", color: "var(--orange)" };
  if (delta >= -8) return { label: "tough slate", color: "var(--red)" };
  return { label: "brutal slate", color: "var(--red)" };
}

export function BureauStrengthOfSchedule({ data, leagueId }: Props) {
  const octo = AGENT_BY_ID.octo;
  const yourRank = data.your_rank as number | undefined;
  const yourPpg = (data.your_ppg as number) ?? 0;
  const oppPpg = (data.opponent_avg_ppg as number) ?? 0;
  const verdict = (data.verdict as string) ?? "Schedule strength loading from league power model.";
  const tone = scheduleTone(yourPpg, oppPpg);
  const delta = Math.round((yourPpg - oppPpg) * 10) / 10;

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
              rest-of-season opponent power vs your scoring pace
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Strength of Schedule
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {yourRank != null ? `#${yourRank} in league power` : "league power model"} · avg opponent {oppPpg} PPG
        </p>
      </header>

      <section className="chunky bg-bg-card p-4">
        <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
          schedule verdict
        </p>
        <p
          className="mt-2 inline-block rounded px-2 py-0.5 text-xs font-bold uppercase text-white"
          style={{ background: tone.color, fontFamily: "var(--font-mono)", transform: "rotate(-1deg)" }}
        >
          {tone.label}
        </p>
        <p className="mt-3 text-sm text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
          {verdict}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="chunky bg-bg p-3">
            <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
              your PPG
            </p>
            <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
              {yourPpg}
            </p>
          </div>
          <div className="chunky bg-bg p-3">
            <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
              avg opp PPG
            </p>
            <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
              {oppPpg}
            </p>
          </div>
          <div className="chunky bg-bg p-3">
            <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
              edge vs field
            </p>
            <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: tone.color }}>
              {delta > 0 ? "+" : ""}
              {delta}
            </p>
          </div>
        </div>
        <Link
          href={
            toRoom({
              agentId: "octo",
              question: `How should I plan around a ${tone.label} rest-of-season schedule?`,
              panelSlug: "strength-of-schedule",
            }) as Route
          }
          className="mt-4 inline-block text-sm text-orange underline"
        >
          ask {octo.name} →
        </Link>
      </section>

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
