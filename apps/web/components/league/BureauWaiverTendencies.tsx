"use client";

import { AGENT_BY_ID } from "@razzle/agents";
import { toRoom } from "@razzle/hallway";
import Link from "next/link";
import type { Route } from "next";
import { useCallback, useState } from "react";

interface Props {
  data: Record<string, unknown>;
  leagueId: string;
}

type WaiverRow = {
  roster_id: number;
  team: string;
  adds: number;
  drops: number;
  faab_spent: number;
  claim_attempts: number;
  archetype: string;
};

const STYLE_COLORS: Record<string, string> = {
  "The Streamer (cheap, frequent)": "var(--pos-wr)",
  "The Hoarder (rare, expensive)": "var(--pos-rb)",
  "The Active Manager (aggressive on both axes)": "var(--orange)",
  "The Set-and-Forget": "var(--pos-qb)",
  "The Opportunist": "var(--pos-te)",
};

export function BureauWaiverTendencies({ data, leagueId }: Props) {
  const [copied, setCopied] = useState(false);
  const copyLink = useCallback(async () => {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, []);

  const hawkeye = AGENT_BY_ID.hawkeye;
  const rows = (data.rows as WaiverRow[]) ?? [];
  const hero = rows[0] ?? null;
  const totalAdds = rows.reduce((n, r) => n + r.adds, 0);

  if (data.error) {
    return <p className="text-red p-6">something fumbled: {String(data.error)}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="chunky bg-bg-card p-6">
        <div className="mb-4 flex items-center gap-3">
          <img src={`/agents/${hawkeye.avatar}.svg`} alt="" className="h-10 w-10" />
          <div>
            <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
              {hawkeye.name} · {hawkeye.role}
            </p>
            <p className="text-sm text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
              who hammers waivers, who hoards FAAB, and what they chase
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Waiver Tendencies
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {rows.length} managers · {totalAdds} adds logged this season
        </p>
      </header>

      {hero && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            wire hawk
          </p>
          <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
            {hero.team} is {hero.archetype} — {hero.adds} adds, ${hero.faab_spent} FAAB burned
          </p>
          <Link
            href={
              toRoom({
                agentId: "hawkeye",
                question: `${hero.team} runs ${hero.archetype} on waivers. Who are they likely to drop next week?`,
                panelSlug: "waiver-tendencies",
              }) as Route
            }
            className="mt-3 inline-block text-sm text-orange underline"
          >
            ask Hawkeye about {hero.team} →
          </Link>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        {rows.map((row, i) => (
          <div
            key={row.roster_id}
            className="chunky bg-bg-card p-4"
            style={{ transform: i % 2 === 0 ? "rotate(-0.4deg)" : "rotate(0.4deg)" }}
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <p className="font-bold" style={{ fontFamily: "var(--font-display)" }}>
                  {row.team}
                </p>
                <p className="text-xs text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
                  {row.adds} adds · {row.drops} drops · ${row.faab_spent} FAAB
                </p>
              </div>
              <span
                className="text-[10px] font-bold uppercase"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: STYLE_COLORS[row.archetype] ?? "var(--ink)",
                  transform: "rotate(-2deg)",
                  border: "2px solid var(--ink)",
                  padding: "0.15rem 0.4rem",
                  background: "var(--bg)",
                }}
              >
                {row.archetype.replace("The ", "")}
              </span>
            </div>
            <p className="text-sm text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
              {row.claim_attempts} claim attempts — predict their next add before the league wakes up
            </p>
          </div>
        ))}
      </section>

      {rows.length === 0 && (
        <p className="chunky bg-bg-card p-6 text-sm text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
          no waiver moves on tape yet — check back after week 1 claims land
        </p>
      )}

      <footer className="flex flex-wrap items-center gap-4 text-sm">
        <button type="button" className="btn-chunky text-xs" onClick={() => void copyLink()}>
          {copied ? "copied!" : "copy link"}
        </button>
        <Link href={`/league/${leagueId}/trade-finder` as Route} className="text-orange underline">
          trade finder →
        </Link>
        <Link href={`/league/${leagueId}/build-profiles` as Route} className="text-orange underline">
          build profiles →
        </Link>
      </footer>
    </div>
  );
}
