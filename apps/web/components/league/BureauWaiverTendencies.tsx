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
  "The Streamer (cheap, frequent)": "var(--pos-rb)",
  "The Hoarder (rare, expensive)": "var(--purple)",
  "The Active Manager (aggressive on both axes)": "var(--orange)",
  "The Set-and-Forget": "var(--ink-medium)",
  "The Opportunist": "var(--pos-wr)",
};

function archetypeColor(archetype: string): string {
  return ARCHETYPE_COLORS[archetype] ?? "var(--pos-te)";
}

export function BureauWaiverTendencies({ data, leagueId }: Props) {
  const hawkeye = AGENT_BY_ID.hawkeye;
  const rows = (data.rows as WaiverRow[]) ?? [];
  const totalAdds = rows.reduce((sum, row) => sum + row.adds, 0);
  const topSpender = [...rows].sort((a, b) => b.faab_spent - a.faab_spent)[0] ?? null;
  const mostActive = [...rows].sort((a, b) => b.adds - a.adds)[0] ?? null;

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
              waiver wire fingerprints — who streams, who hoards FAAB
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Waiver Tendencies
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {rows.length} managers · {totalAdds} total adds tracked
        </p>
      </header>

      {(topSpender || mostActive) && (
        <section className="chunky bg-bg-card p-4">
          <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
            league pulse
          </p>
          <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
            {mostActive && (
              <>
                Most active: <strong>{mostActive.team}</strong> ({mostActive.adds} adds, {mostActive.archetype}).
              </>
            )}
            {topSpender && topSpender.roster_id !== mostActive?.roster_id && (
              <>
                {" "}
                FAAB leader: <strong>{topSpender.team}</strong> (${topSpender.faab_spent} spent).
              </>
            )}
            {" "}
            Screenshot before waivers — predict who blocks your targets.
          </p>
          <Link
            href={
              toRoom({
                agentId: "hawkeye",
                question: `Who in this league is most likely to block my waiver targets this week?`,
                panelSlug: "waiver-tendencies",
              }) as Route
            }
            className="mt-3 inline-block text-sm text-orange underline"
          >
            ask Hawkeye about waiver blocks →
          </Link>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        {!rows.length ? (
          <p className="text-ink-medium text-sm">no waiver tape yet — connect a league with transaction history.</p>
        ) : (
          rows.map((row, i) => {
            const color = archetypeColor(row.archetype);
            return (
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
                      color,
                      border: `2px solid ${color}`,
                      padding: "2px 6px",
                      transform: "rotate(-2deg)",
                    }}
                  >
                    {row.archetype.replace("The ", "")}
                  </span>
                </div>
                <p className="text-sm text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
                  {row.claim_attempts} claim attempts —{" "}
                  {row.archetype === "The Set-and-Forget"
                    ? "unlikely to fight you on the wire."
                    : row.archetype.includes("Hoarder")
                      ? "saves FAAB for one big swing."
                      : row.archetype.includes("Streamer")
                        ? "grabs cheap weekly plugs before you notice."
                        : "mixes volume and budget — watch the add/drop ratio."}
                </p>
                <Link
                  href={
                    toRoom({
                      agentId: "hawkeye",
                      question: `${row.team} is "${row.archetype}" — what waiver moves should I expect?`,
                      panelSlug: "waiver-tendencies",
                    }) as Route
                  }
                  className="mt-2 inline-block text-xs text-orange underline"
                >
                  ask Hawkeye about {row.team} →
                </Link>
              </div>
            );
          })
        )}
      </section>

      <footer className="flex flex-wrap items-center gap-4 text-sm">
        <Link href={`/league/${leagueId}/manager-profiles` as Route} className="text-orange underline">
          manager profiles →
        </Link>
        <Link href={`/league/${leagueId}/trade-finder` as Route} className="text-orange underline">
          trade finder →
        </Link>
        <Link href={`/league/${leagueId}/build-profiles` as Route} className="text-orange underline">
          build profiles →
        </Link>
        <Link href={"/lab/breakouts" as Route} className="text-orange underline">
          breakout panel →
        </Link>
      </footer>
    </div>
  );
}
