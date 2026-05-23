"use client";

import { AGENT_BY_ID } from "@razzle/agents";
import { toRoom } from "@razzle/hallway";
import Link from "next/link";
import type { Route } from "next";

interface Props {
  data: Record<string, unknown>;
  leagueId: string;
}

type ProfileRow = {
  roster_id: number;
  team: string;
  record: string;
  archetype: string;
  exploit_window: string;
  trades: number;
  moves_per_season: number;
  panic_score: number;
};

const ARCHETYPE_COLORS: Record<string, string> = {
  "PANIC SELLER": "var(--red)",
  AGGRESSIVE: "var(--orange)",
  HOARDER: "var(--pos-rb)",
  PATIENT: "var(--pos-qb)",
  STEADY: "var(--ink-medium)",
};

export function BureauManagerProfiles({ data, leagueId }: Props) {
  const bones = AGENT_BY_ID.bones;
  const rows = (data.rows as ProfileRow[]) ?? [];
  const hero = rows.find((r) => r.archetype === "PANIC SELLER") ?? rows[0] ?? null;
  const season = data.season ?? "";

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
              manager scouting reports from transaction tape
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Manager Profiles
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {String(season)} season · {rows.length} managers profiled
        </p>
      </header>

      {hero && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            trade window
          </p>
          <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
            {hero.exploit_window}
          </p>
          <Link
            href={
              toRoom({
                agentId: "bones",
                question: `${hero.team} is a ${hero.archetype} — when should I send a trade offer?`,
                panelSlug: "manager-profiles",
              }) as Route
            }
            className="mt-3 inline-block text-sm text-orange underline"
          >
            ask Bones about {hero.team} →
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
                  {row.record} · {row.moves_per_season.toFixed(1)} moves/yr · panic {row.panic_score}%
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
              {row.exploit_window}
            </p>
          </div>
        ))}
      </section>

      <footer className="text-sm">
        <Link href={`/league/${leagueId}/trade-network` as Route} className="text-orange underline">
          see who trades with whom →
        </Link>
      </footer>
    </div>
  );
}
