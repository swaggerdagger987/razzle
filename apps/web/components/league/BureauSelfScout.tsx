"use client";

import { AGENT_BY_ID } from "@razzle/agents";
import { toRoom } from "@razzle/hallway";
import { PositionPill } from "@razzle/ui";
import Link from "next/link";
import type { Route } from "next";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import { usePlayerSheet } from "@/lib/player-sheet-context";

interface Props {
  data: Record<string, unknown>;
}

type PosBlock = {
  count?: number;
  elite?: number;
  depth?: Array<{ player_id: string; name: string; position: string; dynasty_value?: number | null }>;
};

const POS_ORDER = ["QB", "RB", "WR", "TE"] as const;

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function depthGrade(block: PosBlock): string {
  const count = block.count ?? 0;
  const elite = block.elite ?? 0;
  if (count === 0) return "F";
  if (elite >= 2 || (elite >= 1 && count >= 4)) return "A";
  if (elite >= 1 || count >= 3) return "B";
  if (count >= 2) return "C";
  return "D";
}

function depthScore(block: PosBlock): number {
  const count = block.count ?? 0;
  const elite = block.elite ?? 0;
  const values = (block.depth ?? []).map((p) => p.dynasty_value ?? 0);
  const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  return Math.min(100, Math.round(elite * 25 + count * 12 + avg / 10));
}

export function BureauSelfScout({ data }: Props) {
  const { openPlayer } = usePlayerSheet();
  const params = useParams();
  const leagueId = String(params?.id ?? (data.league as Record<string, unknown>)?.id ?? "");
  const [copied, setCopied] = useState(false);

  const copyScoutLink = useCallback(async () => {
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
  const dolphin = AGENT_BY_ID.dolphin;

  const team = data.team as Record<string, unknown> | undefined;
  const userId = String(team?.user_id ?? "");
  const league = data.league as Record<string, unknown> | undefined;
  const build = data.build_profile as Record<string, unknown> | undefined;
  const rank = data.power_rank as Record<string, unknown> | undefined;
  const flags = (data.vulnerability_flags as Array<Record<string, unknown>>) ?? [];
  const depth = (data.depth as Record<string, PosBlock>) ?? {};

  const weakest = POS_ORDER.reduce(
    (min, pos) => ((depth[pos]?.count ?? 0) < (depth[min]?.count ?? 0) ? pos : min),
    "QB" as (typeof POS_ORDER)[number],
  );

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
              roster depth grades — your league, your tape
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          {String(team?.name ?? "Your Team")}
        </h1>
        <p className="text-ink-medium">
          {String(league?.name ?? "")} · {String(team?.record ?? "")} · {String(team?.points_for ?? 0)} PF /{" "}
          {String(team?.points_against ?? 0)} PA
        </p>
        {rank && (
          <p className="mt-3 text-2xl text-orange" style={{ fontFamily: "var(--font-hand)" }}>
            #{String(rank.rank)} of {String(rank.total)}
          </p>
        )}
      </header>

      <section className="chunky bg-bg-card p-6">
        <h2 className="text-xl" style={{ fontFamily: "var(--font-display)" }}>
          Position Grades
        </h2>
        <p className="mt-1 text-sm text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
          elite assets + depth count — screenshot this for trade threads
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {POS_ORDER.map((pos) => {
            const block = depth[pos] ?? {};
            const grade = depthGrade(block);
            const score = depthScore(block);
            const top = [...(block.depth ?? [])].sort(
              (a, b) => (b.dynasty_value ?? 0) - (a.dynasty_value ?? 0),
            )[0];
            const thin = (block.count ?? 0) <= (pos === "QB" || pos === "TE" ? 1 : 2);
            return (
              <div key={pos} className="chunky bg-bg p-4">
                <div className="flex items-center justify-between">
                  <PositionPill position={pos} />
                  <span
                    className="text-3xl font-bold"
                    style={{ fontFamily: "var(--font-display)", transform: "rotate(-2deg)" }}
                  >
                    {grade}
                  </span>
                </div>
                <p className="mt-2 text-2xl" style={{ fontFamily: "var(--font-mono)" }}>
                  {score}
                  <span className="text-sm text-ink-light">/100</span>
                </p>
                <p className="text-xs text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
                  {block.count ?? 0} rostered · {block.elite ?? 0} elite
                </p>
                {top && (
                  <button
                    type="button"
                    className="mt-2 text-left text-sm font-bold hover:text-orange"
                    onClick={() =>
                      openPlayer({
                        playerId: top.player_id,
                        name: top.name,
                        position: pos,
                        slug: slugify(top.name),
                      })
                    }
                  >
                    {top.name}
                    {top.dynasty_value != null ? ` · ${top.dynasty_value}` : ""}
                  </button>
                )}
                {thin && (
                  <Link
                    href={toRoom({
                      agentId: "dolphin",
                      question: `${pos} depth is thin on my roster — injury risk?`,
                    }) as Route}
                    className="mt-2 block text-xs text-purple hover:underline"
                    style={{ fontFamily: "var(--font-hand)" }}
                  >
                    {dolphin.name}: check {pos} health →
                  </Link>
                )}
              </div>
            );
          })}
        </div>
        {leagueId && userId && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button type="button" className="btn-chunky text-xs" onClick={() => void copyScoutLink()}>
              {copied ? "copied!" : "copy link"}
            </button>
            <a
              href={`/og/self-scout?league=${encodeURIComponent(leagueId)}&user=${encodeURIComponent(userId)}&download=1`}
              download="razzle-self-scout.png"
              className="btn-chunky active text-xs"
              style={{ background: "var(--orange)", color: "var(--text-on-accent)" }}
            >
              export card
            </a>
            <Link
              href={
                toRoom({
                  agentId: "hawkeye",
                  question: `Self-Scout says ${weakest} is my thinnest spot — who should I target?`,
                }) as Route
              }
              className="btn-chunky text-sm bg-bg"
            >
              ask {hawkeye.name} in film room →
            </Link>
          </div>
        )}
      </section>

      {build && (
        <section className="chunky bg-bg-card p-6">
          <h2 className="text-xl" style={{ fontFamily: "var(--font-display)" }}>
            Build Profile
          </h2>
          <p className="mt-1 text-2xl text-orange" style={{ fontFamily: "var(--font-display)" }}>
            {String(build.archetype)}
          </p>
          <p className="text-ink-medium">{String(build.reasoning)}</p>
        </section>
      )}

      {data.how_opponents_see_you != null && (
        <section className="chunky bg-bg-card p-6">
          <h2 className="text-xl" style={{ fontFamily: "var(--font-display)" }}>
            How opponents see you
          </h2>
          <p className="mt-2 text-lg leading-relaxed">{String(data.how_opponents_see_you)}</p>
        </section>
      )}

      {flags.length > 0 && (
        <section className="chunky bg-bg-card p-6">
          <h2 className="text-xl" style={{ fontFamily: "var(--font-display)" }}>
            Vulnerability Flags
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {flags.map((f, i) => (
              <li key={i} className={`chunky px-3 py-2 ${f.severity === "warning" ? "bg-yellow-light" : "bg-bg"}`}>
                <span className="font-bold">[{String(f.position).toUpperCase()}]</span> {String(f.message)}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
