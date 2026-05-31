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

type BuildRow = {
  roster_id: number;
  team: string;
  record: string;
  archetype: string;
  reasoning: string;
};

const ARCHETYPE_COLORS: Record<string, string> = {
  "Hero RB": "var(--pos-rb)",
  "Zero RB": "var(--pos-wr)",
  "Stars & Scrubs": "var(--orange)",
  "Win Now": "var(--pos-qb)",
  "Youth Movement": "var(--pos-te)",
  Balanced: "var(--ink-medium)",
};

export function BureauBuildProfiles({ data, leagueId }: Props) {
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

  const atlas = AGENT_BY_ID.atlas;
  const rows = (data.rows as BuildRow[]) ?? [];
  const hero = rows[0] ?? null;

  if (data.error) {
    return <p className="text-red p-6">something fumbled: {String(data.error)}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="chunky bg-bg-card p-6">
        <div className="mb-4 flex items-center gap-3">
          <img src={`/agents/${atlas.avatar}.svg`} alt="" className="h-10 w-10" />
          <div>
            <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
              {atlas.name} · {atlas.role}
            </p>
            <p className="text-sm text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
              every roster classified by construction — who is win-now vs rebuilding
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Build Profiles
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {rows.length} teams · archetype from depth chart + elite counts
        </p>
      </header>

      {hero && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            league snapshot
          </p>
          <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
            {hero.team} leads the tape as {hero.archetype} — {hero.reasoning}
          </p>
          <Link
            href={
              toRoom({
                agentId: "atlas",
                question: `In this league, ${hero.team} is a ${hero.archetype} build. Who should I target in trades based on roster construction?`,
                panelSlug: "build-profiles",
              }) as Route
            }
            className="mt-3 inline-block text-sm text-orange underline"
          >
            ask Atlas about league builds →
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
                  {row.record}
                </p>
              </div>
              <span
                className="text-[10px] font-bold uppercase"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: ARCHETYPE_COLORS[row.archetype] ?? "var(--ink)",
                  transform: "rotate(-2deg)",
                  border: "2px solid var(--ink)",
                  padding: "0.15rem 0.4rem",
                  background: "var(--bg)",
                }}
              >
                {row.archetype}
              </span>
            </div>
            <p className="text-sm text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
              {row.reasoning}
            </p>
          </div>
        ))}
      </section>

      <footer className="flex flex-wrap items-center gap-4 text-sm">
        <button type="button" className="btn-chunky text-xs" onClick={() => void copyLink()}>
          {copied ? "copied!" : "copy link"}
        </button>
        <Link href={`/league/${leagueId}/roster-depth` as Route} className="text-orange underline">
          roster depth chart →
        </Link>
        <Link href={`/league/${leagueId}/head-to-head` as Route} className="text-orange underline">
          head-to-head →
        </Link>
      </footer>
    </div>
  );
}
