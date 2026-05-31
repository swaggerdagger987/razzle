"use client";

import { AGENT_BY_ID } from "@razzle/agents";
import { toRoom } from "@razzle/hallway";
import Link from "next/link";
import type { Route } from "next";

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

const ARCHETYPE_COLORS: Record<string, string> = {
  "The Streamer (cheap, frequent)": "var(--pos-te)",
  "The Hoarder (rare, expensive)": "var(--pos-qb)",
  "The Active Manager (aggressive on both axes)": "var(--orange)",
  "The Set-and-Forget": "var(--ink-light)",
  "The Opportunist": "var(--pos-wr)",
};

function activityBar(adds: number, maxAdds: number): number {
  if (maxAdds <= 0) return 8;
  return Math.min(100, Math.max(8, Math.round((adds / maxAdds) * 100)));
}

export function BureauWaiverTendencies({ data, leagueId }: Props) {
  const hawkeye = AGENT_BY_ID.hawkeye;
  const rows = (data.rows as WaiverRow[]) ?? [];
  const maxAdds = Math.max(1, ...rows.map((r) => r.adds));
  const hot = rows.find((r) => r.adds === maxAdds && r.adds > 0) ?? rows[0] ?? null;
  const hoarder = rows.find((r) => r.archetype.includes("Hoarder")) ?? null;
  const totalMoves = rows.reduce((sum, r) => sum + r.adds + r.drops, 0);

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
              who claims, who drops, and what waiver archetype each manager runs
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Waiver Tendencies
        </h1>
        <p className="mt-1 text-sm text-ink-medium" style={{ fontFamily: "var(--font-mono)" }}>
          {rows.length} teams · {totalMoves} waiver moves logged
        </p>
      </header>

      {hot && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            most active on waivers
          </p>
          <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
            {hot.team} — {hot.adds} adds, {hot.drops} drops · {hot.archetype}
            {hot.faab_spent > 0 ? ` · $${hot.faab_spent} FAAB spent` : ""}
          </p>
          <Link
            href={
              toRoom({
                agentId: "hawkeye",
                question: `What waiver targets should I expect from ${hot.team} given their ${hot.archetype} style?`,
                panelSlug: "waiver-tendencies",
              }) as Route
            }
            className="mt-3 inline-block text-sm text-orange underline"
          >
            ask Hawkeye about {hot.team} →
          </Link>
        </section>
      )}

      {hoarder && hoarder.roster_id !== hot?.roster_id && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            FAAB watch
          </p>
          <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
            {hoarder.team} — ${hoarder.faab_spent} spent on {hoarder.adds} adds. Expect a big swing soon.
          </p>
        </section>
      )}

      <section className="chunky bg-bg-card p-4">
        <p className="mb-4 text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
          manager waiver styles
        </p>
        {!rows.length ? (
          <p className="text-sm text-ink-medium">
            no waiver tape yet — connect a league with FAAB or free-agent moves.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {rows.map((row) => {
              const color = ARCHETYPE_COLORS[row.archetype] ?? "var(--ink-medium)";
              const width = activityBar(row.adds, maxAdds);
              return (
                <li key={row.roster_id} className="pressure-bar-row">
                  <div className="pressure-bar-name">
                    <span className="font-bold" style={{ fontFamily: "var(--font-display)" }}>
                      {row.team}
                    </span>
                    <span className="text-xs text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
                      {" "}
                      {row.adds}A / {row.drops}D · {row.claim_attempts} claims
                    </span>
                  </div>
                  <div className="pressure-bar-track">
                    <div className="pressure-bar-fill" style={{ width: `${width}%`, background: color }} />
                  </div>
                  <span className="pressure-bar-tag text-xs" style={{ color, borderColor: color }}>
                    {row.archetype.replace("The ", "")}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <footer className="text-xs text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
        league {leagueId.slice(0, 8)}… · archetypes from adds/FAAB mix
      </footer>
    </div>
  );
}
