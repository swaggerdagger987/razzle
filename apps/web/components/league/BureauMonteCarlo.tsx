"use client";

import { AGENT_BY_ID } from "@razzle/agents";
import { toRoom } from "@razzle/hallway";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Route } from "next";
import { useEffect, useState } from "react";
import { getSleeperUser } from "@/lib/sleeper";
import { BureauMonteCarloShareBar } from "./BureauMonteCarloShareBar";
import { BureauRowsTable } from "./BureauRowsTable";

interface Props {
  data: Record<string, unknown>;
  leagueId: string;
}

type OddsRow = {
  roster_id: number;
  manager: string;
  championship_pct: number;
  playoff_pct: number;
  roster_power: number;
};

function barColor(pct: number): string {
  if (pct >= 25) return "var(--green)";
  if (pct >= 10) return "var(--orange)";
  return "var(--red)";
}

export function BureauMonteCarlo({ data, leagueId }: Props) {
  const octo = AGENT_BY_ID.octo;
  const searchParams = useSearchParams();
  const [scenario, setScenario] = useState<Record<string, unknown> | null>(null);
  const giveId = searchParams.get("give");
  const getId = searchParams.get("get");
  const partnerRoster = searchParams.get("partner");

  useEffect(() => {
    if (!giveId || !getId || !partnerRoster) {
      setScenario(null);
      return;
    }
    const user = getSleeperUser();
    if (!user?.user_id) return;

    fetch("/api/bureau/scenario-trade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        league_id: leagueId,
        user_id: user.user_id,
        give_player_id: giveId,
        get_player_id: getId,
        partner_roster_id: Number(partnerRoster),
      }),
    })
      .then((r) => r.json())
      .then((j) => {
        if (!j.error) setScenario(j);
      })
      .catch(() => setScenario(null));
  }, [leagueId, giveId, getId, partnerRoster]);

  const odds = (data.odds as OddsRow[]) ?? [];
  const sims = Number(data.simulations ?? 2000);
  const playoffSpots = Number(data.playoff_spots ?? 6);
  const withStats = Number(data.players_with_stats ?? 0);
  const top = odds[0] ?? null;

  const rows = (data.projections as Array<Record<string, unknown>>)
    ?.filter((p) => Number(p.mean) > 0)
    .sort((a, b) => Number(b.mean) - Number(a.mean))
    .slice(0, 50)
    .map((p) => ({
      player: p.name ?? p.player_id,
      pos: p.position ?? "—",
      mean: p.mean,
      floor: p.floor,
      ceiling: p.ceiling,
      stddev: p.stddev,
      manager: p.manager,
    }));

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
              playoff + championship odds from {sims.toLocaleString()} roster sims
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Monte Carlo
        </h1>
        <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {String(data.season ?? "")} season · top {playoffSpots} make playoffs · {withStats} players with weekly tape
        </p>
      </header>

      {scenario && !scenario.error && (
        <section className="chunky bg-bg-card border-orange border-3 p-4">
          <p className="text-xs uppercase text-orange" style={{ fontFamily: "var(--font-mono)" }}>
            what-if trade
          </p>
          <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
            Send {String(scenario.give_name)} to {String(scenario.partner_team)} for {String(scenario.get_name)}.
          </p>
          <div className="mt-3 flex flex-wrap gap-6" style={{ fontFamily: "var(--font-mono)" }}>
            <div>
              <p className="text-2xl text-orange" style={{ fontFamily: "var(--font-display)" }}>
                {(scenario.delta as { championship_pct: number }).championship_pct >= 0 ? "+" : ""}
                {(scenario.delta as { championship_pct: number }).championship_pct}%
              </p>
              <p className="text-xs text-ink-light">title odds shift</p>
            </div>
            <div>
              <p className="text-2xl" style={{ fontFamily: "var(--font-display)", color: "var(--pos-rb)" }}>
                {(scenario.delta as { playoff_pct: number }).playoff_pct >= 0 ? "+" : ""}
                {(scenario.delta as { playoff_pct: number }).playoff_pct}%
              </p>
              <p className="text-xs text-ink-light">playoff odds shift</p>
            </div>
            <div className="text-sm text-ink-medium">
              {(scenario.baseline as { championship_pct: number }).championship_pct}% →{" "}
              {(scenario.scenario as { championship_pct: number }).championship_pct}% title
            </div>
          </div>
          <Link
            href={
              toRoom({
                agentId: "octo",
                question: `If I trade ${scenario.give_name} for ${scenario.get_name}, title odds move ${(scenario.delta as { championship_pct: number }).championship_pct}% — worth it?`,
                panelSlug: "monte-carlo",
              }) as Route
            }
            className="mt-3 inline-block text-sm text-orange underline"
          >
            ask Octo about this trade →
          </Link>
        </section>
      )}

      {odds.length > 0 && (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {odds.slice(0, 3).map((o, i) => (
            <div
              key={o.roster_id}
              className="chunky bg-bg-card p-4"
              style={{ transform: i % 2 === 0 ? "rotate(-0.5deg)" : "rotate(0.5deg)" }}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <p className="font-bold" style={{ fontFamily: "var(--font-display)" }}>
                  {o.manager}
                </p>
                <span className="text-xs text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
                  #{i + 1}
                </span>
              </div>
              <div className="flex items-end gap-4">
                <div>
                  <p className="text-3xl text-orange" style={{ fontFamily: "var(--font-display)" }}>
                    {o.championship_pct}%
                  </p>
                  <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
                    title
                  </p>
                </div>
                <div>
                  <p className="text-2xl" style={{ fontFamily: "var(--font-display)", color: "var(--pos-rb)" }}>
                    {o.playoff_pct ?? 0}%
                  </p>
                  <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
                    playoffs
                  </p>
                </div>
              </div>
              <div className="mt-2 flex flex-col gap-1" role="presentation">
                <div className="h-2 border-2 border-ink bg-bg">
                  <div
                    className="h-full"
                    style={{
                      width: `${Math.min(100, o.championship_pct * 2)}%`,
                      background: barColor(o.championship_pct),
                    }}
                  />
                </div>
                <div className="h-2 border-2 border-ink bg-bg">
                  <div
                    className="h-full"
                    style={{
                      width: `${Math.min(100, o.playoff_pct ?? 0)}%`,
                      background: "var(--pos-rb)",
                    }}
                  />
                </div>
              </div>
              <p className="text-ink-medium mt-2 text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                roster power {o.roster_power}
              </p>
            </div>
          ))}
        </section>
      )}

      {odds.length === 0 && (
        <p className="text-ink-medium p-4" style={{ fontFamily: "var(--font-hand)" }}>
          {octo.emptyCopy}
        </p>
      )}

      {odds.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl" style={{ fontFamily: "var(--font-display)" }}>
            League odds board
          </h2>
          <div
            className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            aria-label="All managers championship and playoff odds"
          >
            {odds.map((o, i) => (
              <div key={`grid-${o.roster_id}`} className="chunky bg-bg-card p-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-bold" style={{ fontFamily: "var(--font-display)" }}>
                    {o.manager}
                  </p>
                  <span className="text-xs text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
                    #{i + 1}
                  </span>
                </div>
                <div className="flex gap-3 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
                  <span className="text-orange">{o.championship_pct}% title</span>
                  <span style={{ color: "var(--pos-rb)" }}>{o.playoff_pct ?? 0}% playoffs</span>
                </div>
                <div className="mt-1 flex flex-col gap-0.5" role="presentation">
                  <div className="h-1.5 border border-ink bg-bg">
                    <div
                      className="h-full"
                      style={{
                        width: `${Math.min(100, o.championship_pct * 2)}%`,
                        background: barColor(o.championship_pct),
                      }}
                    />
                  </div>
                  <div className="h-1.5 border border-ink bg-bg">
                    <div
                      className="h-full"
                      style={{
                        width: `${Math.min(100, o.playoff_pct ?? 0)}%`,
                        background: "var(--pos-rb)",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {top && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={
                toRoom({
                  agentId: "octo",
                  question: `${top.manager} leads at ${top.championship_pct}% title / ${top.playoff_pct ?? 0}% playoff odds — what moves the needle?`,
                }) as Route
              }
              className="btn-chunky w-fit text-sm"
            >
              ask {octo.name} in film room →
            </Link>
          </div>
          {(() => {
            const user = getSleeperUser();
            if (!user?.user_id) return null;
            const scenarioParts: string[] = [];
            if (giveId) scenarioParts.push(`give=${encodeURIComponent(giveId)}`);
            if (getId) scenarioParts.push(`get=${encodeURIComponent(getId)}`);
            if (partnerRoster) scenarioParts.push(`partner=${encodeURIComponent(partnerRoster)}`);
            return (
              <BureauMonteCarloShareBar
                leagueId={leagueId}
                userId={user.user_id}
                scenarioQuery={scenarioParts.length ? scenarioParts.join("&") : undefined}
                odds={odds.slice(0, 3)}
              />
            );
          })()}
        </div>
      )}

      {rows && rows.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl" style={{ fontFamily: "var(--font-display)" }}>
            Player distributions
          </h2>
          <BureauRowsTable rows={rows} emptyMessage="no weekly stats yet — sync terminal.db" />
        </section>
      )}
    </div>
  );
}
