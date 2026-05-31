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
  const hasError = typeof data.error === "string";
  const yourRank = data.your_rank != null ? Number(data.your_rank) : null;
  const yourPpg = typeof data.your_ppg === "number" ? data.your_ppg : null;
  const oppAvg = typeof data.opponent_avg_ppg === "number" ? data.opponent_avg_ppg : null;
  const verdict = typeof data.verdict === "string" ? data.verdict : null;
  const diff = yourPpg != null && oppAvg != null ? yourPpg - oppAvg : null;

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
              remaining path difficulty from league scoring power
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Strength of Schedule
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {yourRank != null ? `you rank #${yourRank} in power board` : "connect your Sleeper team"}
        </p>
      </header>

      {hasError && (
        <p className="chunky bg-bg-card p-4 text-sm text-ink-medium">{String(data.error)}</p>
      )}

      {!hasError && yourPpg != null && oppAvg != null && (
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="chunky bg-bg-card p-4">
            <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
              your scoring
            </p>
            <p className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--orange)" }}>
              {yourPpg.toFixed(1)}
            </p>
            <p className="text-xs text-ink-medium" style={{ fontFamily: "var(--font-mono)" }}>
              PPG
            </p>
          </div>
          <div className="chunky bg-bg-card p-4">
            <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
              avg opponent
            </p>
            <p className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
              {oppAvg.toFixed(1)}
            </p>
            <p className="text-xs text-ink-medium" style={{ fontFamily: "var(--font-mono)" }}>
              league PPG
            </p>
          </div>
          <div className="chunky bg-bg-card p-4">
            <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
              edge vs field
            </p>
            <p
              className="text-3xl font-bold"
              style={{
                fontFamily: "var(--font-display)",
                color: diff != null && diff >= 0 ? "var(--green)" : "var(--red)",
              }}
            >
              {diff != null ? `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}` : "—"}
            </p>
            <p className="text-xs text-ink-medium" style={{ fontFamily: "var(--font-mono)" }}>
              PPG differential
            </p>
          </div>
        </section>
      )}

      {verdict && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            schedule verdict
          </p>
          <p className="mt-2 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
            {verdict}
          </p>
          <Link
            href={
              toRoom({
                agentId: "octo",
                question: "How does my remaining schedule compare to the league median?",
                panelSlug: "strength-of-schedule",
              }) as Route
            }
            className="mt-3 inline-block text-sm text-orange underline"
          >
            ask Octo about your path →
          </Link>
        </section>
      )}

      <footer className="flex flex-wrap items-center gap-4 text-sm">
        <Link href={`/league/${leagueId}/power-rankings` as Route} className="text-orange underline">
          full power rankings →
        </Link>
        <Link href={`/league/${leagueId}/self-scout` as Route} className="text-orange underline">
          self-scout →
        </Link>
      </footer>
    </div>
  );
}
