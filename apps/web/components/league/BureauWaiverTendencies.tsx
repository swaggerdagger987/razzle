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

export function BureauWaiverTendencies({ data, leagueId }: Props) {
  const [copied, setCopied] = useState(false);
  const copyWaiverLink = useCallback(async () => {
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
  const totalAdds = rows.reduce((sum, r) => sum + r.adds, 0);

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
              who chases waivers, who hoards FAAB, who panic-drops
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Waiver Tendencies
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {rows.length} managers · {totalAdds} adds logged
        </p>
      </header>

      {hero && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            most active on waivers
          </p>
          <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
            {hero.team} — {hero.archetype}. {hero.adds} adds, ${hero.faab_spent} FAAB spent.
          </p>
          <Link
            href={
              toRoom({
                agentId: "hawkeye",
                question: `Should I block ${hero.team} on waivers this week? They profile as ${hero.archetype}.`,
                panelSlug: "waiver-tendencies",
              }) as Route
            }
            className="mt-3 inline-block text-sm text-orange underline"
          >
            ask Hawkeye about {hero.team} →
          </Link>
        </section>
      )}

      {rows.length === 0 ? (
        <p className="text-ink-medium text-sm" style={{ fontFamily: "var(--font-hand)" }}>
          no waiver transactions yet — check back after FAAB runs.
        </p>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2">
          {rows.map((row, i) => (
            <div
              key={row.roster_id}
              className="chunky bg-bg-card p-4"
              style={{ transform: i % 2 === 0 ? "rotate(-0.3deg)" : "rotate(0.3deg)" }}
            >
              <p className="font-bold" style={{ fontFamily: "var(--font-display)" }}>
                {row.team}
              </p>
              <p className="text-xs text-ink-light mt-1" style={{ fontFamily: "var(--font-mono)" }}>
                {row.adds} adds · {row.drops} drops · ${row.faab_spent} FAAB
              </p>
              <p className="text-ink-medium mt-2 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
                {row.archetype}
              </p>
            </div>
          ))}
        </section>
      )}

      <footer className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="btn-chunky text-xs" onClick={() => void copyWaiverLink()}>
            {copied ? "copied!" : "copy link"}
          </button>
        </div>
        <Link href={`/league/${leagueId}/trade-finder` as Route} className="text-orange underline">
          trade finder →
        </Link>
        <Link href={`/league/${leagueId}/build-profiles` as Route} className="text-orange underline">
          build profiles →
        </Link>
        <Link href={`/league/${leagueId}/manager-profiles` as Route} className="text-orange underline">
          manager profiles →
        </Link>
      </footer>
    </div>
  );
}
