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

type PressureRow = {
  roster_id: number;
  team: string;
  record: string;
  score: number;
  label: string;
  trades: number;
  panic_score: number;
};

function barColor(score: number): string {
  if (score >= 60) return "var(--red)";
  if (score >= 35) return "var(--orange)";
  return "var(--green)";
}

export function BureauPressureMap({ data, leagueId }: Props) {
  const bones = AGENT_BY_ID.bones;
  const rows = (data.rows as PressureRow[]) ?? [];
  const hero = rows[0] ?? null;
  const season = data.season ?? "";
  const [copied, setCopied] = useState(false);
  const chartPath = `/league/${leagueId}/pressure-map`;

  const copyChartLink = useCallback(async () => {
    const url =
      typeof window !== "undefined" ? `${window.location.origin}${chartPath}` : chartPath;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [chartPath]);

  return (
    <div className="flex flex-col gap-6">
      <header className="chunky bg-bg-card p-6">
        <div className="mb-4 flex items-center gap-3">
          <img src={`/agents/${bones.avatar}.svg`} alt="" className="h-10 w-10" />
          <div>
            <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
              {bones.name} · {bones.role}
            </p>
            <p className="text-sm text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
              who&apos;s desperate before the deadline?
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Pressure Map
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {String(season)} season · desperation 0–100
        </p>
      </header>

      {hero && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            top pressure
          </p>
          <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
            {hero.team} ({hero.record}) — {hero.label} at {hero.score}. Strike while they&apos;re motivated to
            move pieces.
          </p>
          <Link
            href={
              toRoom({
                agentId: "bones",
                question: `${hero.team} has pressure score ${hero.score} — what trade angle works before the deadline?`,
                panelSlug: "pressure-map",
              }) as Route
            }
            className="mt-3 inline-block text-sm text-orange underline"
          >
            ask Bones about {hero.team} →
          </Link>
        </section>
      )}

      <section className="chunky bg-bg-card p-4">
        <p
          className="mb-4 text-xs uppercase text-ink-light"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          trade deadline pressure
        </p>
        <ul className="flex flex-col gap-3">
          {rows.map((row) => {
            const color = barColor(row.score);
            return (
              <li key={row.roster_id} className="pressure-bar-row">
                <div className="pressure-bar-name">
                  <span className="font-bold" style={{ fontFamily: "var(--font-display)" }}>
                    {row.team}
                  </span>
                  <span className="text-xs text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
                    {" "}
                    {row.record}
                  </span>
                </div>
                <div className="pressure-bar-track">
                  <div
                    className="pressure-bar-fill"
                    style={{ width: `${row.score}%`, background: color }}
                  />
                </div>
                <span className="pressure-bar-score" style={{ color }}>
                  {row.score}
                </span>
                <span
                  className="pressure-bar-tag"
                  style={{ color, borderColor: color }}
                >
                  {row.label}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <footer className="flex flex-wrap items-center gap-4 text-sm">
        <button type="button" className="btn-chunky text-xs" onClick={() => void copyChartLink()}>
          {copied ? "copied!" : "copy chart link"}
        </button>
        <a
          href={`/og/pressure-map?league=${encodeURIComponent(leagueId)}&download=1`}
          download="razzle-pressure-map.png"
          className="btn-chunky active text-xs"
          style={{ background: "var(--orange)", color: "var(--text-on-accent)" }}
        >
          export card
        </a>
        <Link href={`/league/${leagueId}/manager-profiles` as Route} className="text-orange underline">
          manager profiles →
        </Link>
        <Link href={`/league/${leagueId}/trade-network` as Route} className="text-orange underline">
          trade network →
        </Link>
        <Link href={`/league/${leagueId}/trade-finder` as Route} className="text-orange underline">
          trade finder →
        </Link>
      </footer>
    </div>
  );
}
