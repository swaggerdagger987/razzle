"use client";

import { AGENT_BY_ID } from "@razzle/agents";
import type { PanelDefinition } from "@razzle/panels";
import { PositionPill } from "@razzle/ui";
import { toRoom } from "@razzle/hallway";
import Link from "next/link";
import type { Route } from "next";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { usePlayerSheet } from "@/lib/player-sheet-context";

interface DashboardPlayer {
  player_id: string;
  full_name: string;
  position: string;
  team: string;
  age?: number;
  ppg?: number;
  trade_value?: number;
  rank_diff?: number;
}

interface PositionTrend {
  count?: number;
  avg_ppg?: number;
  avg_age?: number;
  avg_tv?: number;
}

interface ScarcityRow {
  top_player?: string;
  top_ppg?: number;
  mid_player?: string;
  mid_ppg?: number;
  dropoff?: number;
  count?: number;
}

interface DashboardData {
  season?: number;
  available_seasons?: number[];
  total_players?: number;
  top5?: DashboardPlayer[];
  risers?: DashboardPlayer[];
  fallers?: DashboardPlayer[];
  value_picks?: DashboardPlayer[];
  trends?: Record<string, PositionTrend>;
  position_scarcity?: Record<string, ScarcityRow>;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function PlayerRow({
  player,
  rank,
  chip,
  chipClass,
  onOpen,
}: {
  player: DashboardPlayer;
  rank: number;
  chip: string;
  chipClass: string;
  onOpen: (p: DashboardPlayer) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-dashed border-ink-faint py-2 last:border-0">
      <span className="text-ink-light w-6 text-xs" style={{ fontFamily: "var(--font-mono)" }}>
        {rank}
      </span>
      <PositionPill position={player.position as "QB" | "RB" | "WR" | "TE"} />
      <button
        type="button"
        className="min-w-0 flex-1 text-left font-bold underline-offset-2 hover:underline"
        onClick={() => onOpen(player)}
      >
        {player.full_name}
      </button>
      <span className="text-ink-light text-xs">{player.team}</span>
      <span className="text-xs text-blue" style={{ fontFamily: "var(--font-mono)" }}>
        {player.ppg ?? "—"} PPG
      </span>
      <span
        className={`rounded border-2 px-2 py-0.5 text-xs font-bold ${chipClass}`}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {chip}
      </span>
    </div>
  );
}

interface Props {
  panel: PanelDefinition;
}

export function DynastyDashboardRenderer({ panel }: Props) {
  const { openPlayer } = usePlayerSheet();
  const razzle = AGENT_BY_ID.razzle;
  const [season, setSeason] = useState<number | "">("");

  const q = useQuery({
    queryKey: ["panel", panel.slug, season],
    queryFn: async () => {
      const qs = season ? `?season=${season}` : "";
      const res = await fetch(`/api/panels/${panel.slug}${qs}`);
      if (!res.ok) throw new Error(`API ${res.status}`);
      return res.json() as Promise<DashboardData>;
    },
  });

  const topRiser = q.data?.risers?.[0];
  const maxDropoff = useMemo(() => {
    const rows = q.data?.position_scarcity ?? {};
    return Math.max(0, ...Object.values(rows).map((s) => s.dropoff ?? 0));
  }, [q.data?.position_scarcity]);

  const open = (p: DashboardPlayer) => {
    openPlayer({
      playerId: p.player_id,
      slug: slugify(p.full_name),
      name: p.full_name,
      position: p.position,
      team: p.team,
    });
  };

  if (q.isPending) {
    return (
      <p className="text-ink-medium p-6" style={{ fontFamily: "var(--font-hand)" }}>
        {razzle.loadingCopy}
      </p>
    );
  }

  if (q.isError) {
    return <p className="p-6 text-red">something fumbled: {(q.error as Error).message}</p>;
  }

  const data = q.data!;
  const seasons = data.available_seasons ?? [];

  return (
    <div className="dynasty-dashboard">
      <header className="panel-agent-header mb-4 flex items-start gap-3">
        <img src={`/agents/${razzle.avatar}.svg`} alt="" width={40} height={40} className="rounded-full" />
        <div>
          <p className="text-sm font-bold">{razzle.name}</p>
          <p className="text-ink-medium text-xs">{razzle.role} · dynasty pulse check</p>
        </div>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        {seasons.length > 1 && (
          <select
            className="btn-chunky text-sm"
            value={data.season ?? ""}
            onChange={(e) => setSeason(Number(e.target.value) || "")}
            aria-label="Season"
          >
            {seasons.map((s) => (
              <option key={s} value={s}>
                {s} season
              </option>
            ))}
          </select>
        )}
        {data.total_players != null && (
          <p className="text-ink-medium text-sm" style={{ fontFamily: "var(--font-mono)" }}>
            {data.season} · {data.total_players} players tracked
          </p>
        )}
      </div>

      {(data.top5?.length ?? 0) > 0 && (
        <section className="mb-6">
          <h3 className="mb-3 text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Top dynasty assets
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {data.top5!.map((p, i) => (
              <button
                key={p.player_id}
                type="button"
                className="chunky bg-bg-card p-3 text-left hover:bg-bg-warm"
                onClick={() => open(p)}
              >
                <p className="text-ink-light text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                  #{i + 1}
                </p>
                <p className="font-bold">{p.full_name}</p>
                <p className="text-orange text-xl font-bold" style={{ fontFamily: "var(--font-mono)" }}>
                  {p.trade_value ?? "—"}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1 text-xs">
                  <PositionPill position={p.position as "QB" | "RB" | "WR" | "TE"} />
                  <span className="text-ink-light">{p.team}</span>
                  <span style={{ fontFamily: "var(--font-mono)" }}>{p.ppg} PPG</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {data.trends && (
        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {(["QB", "RB", "WR", "TE"] as const).map((pos) => {
            const t = data.trends![pos];
            if (!t) return null;
            return (
              <div key={pos} className="chunky bg-bg-card p-3">
                <p className="font-bold text-sm">{pos}</p>
                <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-mono)" }}>
                  {t.avg_ppg ?? "—"}
                </p>
                <p className="text-ink-light text-xs">avg PPG</p>
                <p className="text-ink-medium mt-1 text-xs">
                  {t.count} players · avg age {t.avg_age}
                </p>
              </div>
            );
          })}
        </section>
      )}

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <section className="chunky bg-bg-card p-4">
          <h3 className="mb-2 font-bold text-teal" style={{ fontFamily: "var(--font-display)" }}>
            ↗ Rising stocks
          </h3>
          {(data.risers?.length ?? 0) === 0 ? (
            <p className="text-ink-medium text-sm">{razzle.emptyCopy}</p>
          ) : (
            data.risers!.map((p, i) => (
              <PlayerRow
                key={p.player_id}
                player={p}
                rank={i + 1}
                chip={`+${p.rank_diff ?? 0}`}
                chipClass="border-teal bg-teal/10 text-teal"
                onOpen={open}
              />
            ))
          )}
        </section>

        <section className="chunky bg-bg-card p-4">
          <h3 className="mb-2 font-bold text-red" style={{ fontFamily: "var(--font-display)" }}>
            ↘ Falling stocks
          </h3>
          {(data.fallers?.length ?? 0) === 0 ? (
            <p className="text-ink-medium text-sm">{razzle.emptyCopy}</p>
          ) : (
            data.fallers!.map((p, i) => (
              <PlayerRow
                key={p.player_id}
                player={p}
                rank={i + 1}
                chip={String(p.rank_diff ?? 0)}
                chipClass="border-red bg-red/10 text-red"
                onOpen={open}
              />
            ))
          )}
        </section>

        <section className="chunky bg-bg-card p-4">
          <h3 className="mb-2 font-bold text-orange" style={{ fontFamily: "var(--font-display)" }}>
            Value picks
          </h3>
          {(data.value_picks?.length ?? 0) === 0 ? (
            <p className="text-ink-medium text-sm">{razzle.emptyCopy}</p>
          ) : (
            data.value_picks!.map((p, i) => (
              <PlayerRow
                key={p.player_id}
                player={p}
                rank={i + 1}
                chip={String(p.trade_value ?? "—")}
                chipClass="border-orange bg-orange/10 text-orange"
                onOpen={open}
              />
            ))
          )}
        </section>
      </div>

      {data.position_scarcity && (
        <section className="chunky bg-bg-card p-4">
          <h3 className="mb-3 font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Position scarcity
          </h3>
          {(["QB", "RB", "WR", "TE"] as const).map((pos) => {
            const s = data.position_scarcity![pos];
            if (!s) return null;
            const pct = maxDropoff > 0 ? Math.round(((s.dropoff ?? 0) / maxDropoff) * 100) : 0;
            return (
              <div key={pos} className="mb-3 flex flex-wrap items-center gap-3 last:mb-0">
                <span className="w-8 font-bold">{pos}</span>
                <div className="h-3 min-w-[120px] flex-1 overflow-hidden rounded bg-bg-warm">
                  <div
                    className={`h-full bg-pos-${pos.toLowerCase()}`}
                    style={{ width: `${pct}%`, background: `var(--pos-${pos.toLowerCase()})` }}
                  />
                </div>
                <span className="text-ink-light text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                  {s.top_player} ({s.top_ppg}) → {s.mid_player} ({s.mid_ppg}) = −{s.dropoff}
                </span>
              </div>
            );
          })}
        </section>
      )}

      {topRiser && (
        <footer className="mt-6 border-t border-ink pt-4">
          <Link
            href={
              toRoom({
                agentId: "razzle",
                panelSlug: "dashboard",
                question: `${topRiser.full_name} is a rising stock (+${topRiser.rank_diff} rank diff) at ${topRiser.trade_value} dynasty value — buy window or noise?`,
              }) as Route
            }
            className="text-sm text-orange underline"
          >
            Ask Razzle about {topRiser.full_name} (rising stock) →
          </Link>
        </footer>
      )}
    </div>
  );
}
