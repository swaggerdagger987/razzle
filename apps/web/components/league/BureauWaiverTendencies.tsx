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

const STYLE_COLORS: Record<string, string> = {
  "The Streamer (cheap, frequent)": "var(--pos-rb)",
  "The Hoarder (rare, expensive)": "var(--pos-qb)",
  "The Active Manager (aggressive on both axes)": "var(--orange)",
  "The Set-and-Forget": "var(--ink-light)",
  "The Opportunist": "var(--pos-wr)",
};

export function BureauWaiverTendencies({ data, leagueId }: Props) {
  const bones = AGENT_BY_ID.bones;
  const rows = (data.rows as WaiverRow[]) ?? [];
  const hero = rows.find((r) => r.archetype.includes("Hoarder")) ?? rows[0] ?? null;
  const totalAdds = rows.reduce((sum, r) => sum + r.adds, 0);

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
              who hoards FAAB, who panic-drops, who streams every week
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Waiver Tendencies
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {totalAdds} adds league-wide · {rows.length} managers tracked
        </p>
      </header>

      {hero && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            exploit window
          </p>
          <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
            {hero.team} — <span style={{ color: STYLE_COLORS[hero.archetype] ?? "var(--orange)" }}>{hero.archetype}</span>
            . {hero.adds} adds, ${hero.faab_spent} FAAB spent, {hero.claim_attempts} claim attempts.
          </p>
          <Link
            href={
              toRoom({
                agentId: "bones",
                question: `How do I exploit ${hero.team}'s waiver style (${hero.archetype}) before deadline?`,
                panelSlug: "waiver-tendencies",
              }) as Route
            }
            className="mt-3 inline-block text-sm text-orange underline"
          >
            ask Bones about {hero.team} →
          </Link>
        </section>
      )}

      {rows.length === 0 ? (
        <p className="text-ink-medium text-sm" style={{ fontFamily: "var(--font-hand)" }}>
          no waiver moves yet — check back after the first FAAB claims drop.
        </p>
      ) : (
        <section className="table-wrap chunky bg-bg-card">
          <table className="screener-table">
            <thead className="thead-shadow">
              <tr>
                <th>team</th>
                <th>style</th>
                <th>adds</th>
                <th>drops</th>
                <th>faab</th>
                <th>claims</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.roster_id} className="screener-row">
                  <td className="font-bold">{row.team}</td>
                  <td style={{ color: STYLE_COLORS[row.archetype] ?? "var(--ink)" }}>{row.archetype}</td>
                  <td>{row.adds}</td>
                  <td>{row.drops}</td>
                  <td>${row.faab_spent}</td>
                  <td>{row.claim_attempts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <footer className="flex flex-wrap gap-4 text-sm">
        <Link href={`/league/${leagueId}/manager-profiles` as Route} className="text-orange underline">
          manager profiles →
        </Link>
        <Link href={`/league/${leagueId}/pressure-map` as Route} className="text-orange underline">
          pressure map →
        </Link>
        <Link href={`/league/${leagueId}/trade-finder` as Route} className="text-orange underline">
          trade finder →
        </Link>
      </footer>
    </div>
  );
}
