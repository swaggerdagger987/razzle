"use client";

import type { PanelDefinition } from "@razzle/panels";
import { toRoom } from "@razzle/hallway";
import Link from "next/link";
import type { Route } from "next";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { SavedFormula } from "@/lib/formulas";
import {
  fetchPlayerStatsForFormula,
  sortPlayersByFormula,
  type WithFormulaScore,
} from "@/lib/panel-formula-sort";
import { usePlayerSheet } from "@/lib/player-sheet-context";
import { FormulaPanelBar } from "../FormulaPanelBar";
import { LabOgExportLink, type OgSnapshotRow } from "../LabOgExportLink";
import { PanelAgentHeader, PanelAgentLoading, panelAgent } from "../PanelAgentHeader";
import { ProGateFromPanelError } from "../ProGateFromPanelError";

const POSITIONS = ["QB", "RB", "WR", "TE"] as const;

/** Sample PPG board when aging curve API returns no rows — OG export still screenshots. */
const AGING_SAMPLE_OG_ROWS: OgSnapshotRow[] = [
  { name: "Christian McCaffrey", position: "RB", team: "SF", stat: 18.2, statLabel: "PPG" },
  { name: "Bijan Robinson", position: "RB", team: "ATL", stat: 17.4, statLabel: "PPG" },
  { name: "Ja'Marr Chase", position: "WR", team: "CIN", stat: 16.8, statLabel: "PPG" },
  { name: "Justin Jefferson", position: "WR", team: "MIN", stat: 16.1, statLabel: "PPG" },
  { name: "Travis Kelce", position: "TE", team: "KC", stat: 12.4, statLabel: "PPG" },
  { name: "Josh Allen", position: "QB", team: "BUF", stat: 22.1, statLabel: "PPG" },
];

const POS_COLORS: Record<(typeof POSITIONS)[number], string> = {
  QB: "#5b7fff",
  RB: "#2ec4b6",
  WR: "#d97757",
  TE: "#8b5cf6",
};

interface CurvePoint {
  age: number;
  ppg: number;
  sample_size?: number;
}

interface AgingPlayer extends WithFormulaScore {
  player_id: string;
  name: string;
  team: string;
  age: number;
  ppg: number;
  games?: number;
}

interface PositionData {
  curve: CurvePoint[];
  players: AgingPlayer[];
  peak_age: number | null;
  peak_ppg: number;
}

interface AgingData {
  season?: number;
  available_seasons?: number[];
  positions?: Record<string, PositionData>;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function AgingChart({
  curve,
  players,
  peakAge,
  color,
  onPlayerClick,
}: {
  curve: CurvePoint[];
  players: AgingPlayer[];
  peakAge: number | null;
  color: string;
  onPlayerClick: (p: AgingPlayer) => void;
}) {
  const layout = useMemo(() => {
    if (!curve.length) return null;

    const ages = curve.map((c) => c.age);
    const ppgs = curve.map((c) => c.ppg);
    for (const p of players.slice(0, 12)) {
      ppgs.push(p.ppg);
    }
    const minAge = Math.floor(Math.min(...ages));
    const maxAge = Math.ceil(Math.max(...ages));
    const maxPpg = Math.ceil(Math.max(...ppgs, 1) / 5) * 5 + 5;

    const pad = { l: 48, r: 24, t: 32, b: 40 };
    const w = 640;
    const h = 320;
    const chartW = w - pad.l - pad.r;
    const chartH = h - pad.t - pad.b;

    const x = (age: number) => pad.l + ((age - minAge) / (maxAge - minAge || 1)) * chartW;
    const y = (ppg: number) => pad.t + chartH - (ppg / maxPpg) * chartH;

    const path = curve
      .map((pt, i) => `${i === 0 ? "M" : "L"} ${x(pt.age).toFixed(1)} ${y(pt.ppg).toFixed(1)}`)
      .join(" ");

    const dots = players.slice(0, 12).map((p) => ({
      player: p,
      cx: x(p.age),
      cy: y(p.ppg),
    }));

    return { path, dots, minAge, maxAge, maxPpg, x, y, pad, w, h, chartH };
  }, [curve, players]);

  if (!layout) {
    return <p className="text-ink-medium p-6">No curve data for this position yet.</p>;
  }

  const { path, dots, minAge, maxAge, maxPpg, x, y, pad, w, h, chartH } = layout;
  const yGrid = [0, 5, 10, 15, 20, 25, 30].filter((v) => v <= maxPpg);

  return (
    <div className="chunky bg-bg-card overflow-x-auto p-4">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-3xl" role="img" aria-label="Aging curve chart">
        {yGrid.map((ppg) => (
          <g key={ppg}>
            <line x1={pad.l} y1={y(ppg)} x2={w - pad.r} y2={y(ppg)} stroke="var(--ink-faint)" strokeDasharray="4 4" />
            <text x={pad.l - 8} y={y(ppg) + 4} textAnchor="end" fontSize={10} fill="var(--ink-medium)" fontFamily="var(--font-mono)">
              {ppg}
            </text>
          </g>
        ))}
        {Array.from({ length: maxAge - minAge + 1 }, (_, i) => minAge + i).map((age) => (
          <text key={age} x={x(age)} y={h - 12} textAnchor="middle" fontSize={10} fill="var(--ink-medium)" fontFamily="var(--font-mono)">
            {age}
          </text>
        ))}
        {peakAge != null && (
          <line x1={x(peakAge)} y1={pad.t} x2={x(peakAge)} y2={pad.t + chartH} stroke={color} strokeWidth={2} strokeDasharray="6 4" opacity={0.6} />
        )}
        <path d={path} fill="none" stroke={color} strokeWidth={3} strokeLinejoin="round" />
        {dots.map(({ player, cx, cy }) => (
          <circle
            key={player.player_id}
            cx={cx}
            cy={cy}
            r={5}
            fill={color}
            stroke="var(--ink)"
            strokeWidth={2}
            className="cursor-pointer"
            onClick={() => onPlayerClick(player)}
          >
            <title>{`${player.name} · age ${player.age} · ${player.ppg} PPG`}</title>
          </circle>
        ))}
        <text x={w / 2} y={h - 4} textAnchor="middle" fontSize={11} fill="var(--ink)" fontFamily="var(--font-mono)">
          Age
        </text>
        <text x={14} y={h / 2} textAnchor="middle" fontSize={11} fill="var(--ink)" fontFamily="var(--font-mono)" transform={`rotate(-90 14 ${h / 2})`}>
          PPG
        </text>
      </svg>
      {peakAge != null && (
        <p className="text-ink-medium mt-2 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
          Peak production around age {peakAge} — plan sell windows before the cliff.
        </p>
      )}
    </div>
  );
}

interface Props {
  panel: PanelDefinition;
}

export function AgingCurvesRenderer({ panel }: Props) {
  const { openPlayer } = usePlayerSheet();
  const [position, setPosition] = useState<(typeof POSITIONS)[number]>("RB");
  const [season, setSeason] = useState<number | "">("");
  const [formula, setFormula] = useState<SavedFormula | null>(null);
  const agent = panelAgent(panel.slug);

  const q = useQuery({
    queryKey: ["panel", panel.slug, position, season],
    queryFn: async () => {
      const params = new URLSearchParams({ position });
      if (season) params.set("season", String(season));
      const res = await fetch(`/api/panels/${panel.slug}?${params}`);
      if (res.status === 402) {
        const body = await res.json().catch(() => ({}));
        const detail = (body as { detail?: Record<string, string> }).detail ?? {};
        throw Object.assign(new Error(detail.message ?? "Pro plan required"), { upgrade: detail });
      }
      if (!res.ok) throw new Error(`API ${res.status}`);
      return res.json() as Promise<AgingData>;
    },
  });

  const posData = q.data?.positions?.[position];
  const peakAge = posData?.peak_age ?? null;
  const rawPlayers = posData?.players ?? [];
  const playerIds = useMemo(() => rawPlayers.map((p) => p.player_id), [rawPlayers]);

  const statsQ = useQuery({
    queryKey: ["panel-formula-stats", panel.slug, q.data?.season, playerIds, formula?.name],
    queryFn: () => fetchPlayerStatsForFormula(playerIds, q.data?.season ?? 0),
    enabled: Boolean(formula && playerIds.length),
  });

  const chartPlayers = useMemo(() => {
    if (!formula || !statsQ.data) return rawPlayers;
    return sortPlayersByFormula(rawPlayers, statsQ.data, formula);
  }, [formula, rawPlayers, statsQ.data]);

  const pastPeak = useMemo(() => {
    const filtered = rawPlayers.filter((p) => peakAge != null && p.age > peakAge);
    if (!formula || !statsQ.data) return filtered.slice(0, 5);
    return [...sortPlayersByFormula(filtered, statsQ.data, formula)].reverse().slice(0, 5);
  }, [formula, rawPlayers, statsQ.data, peakAge]);

  const top = chartPlayers[0] ?? null;

  const ogSnapshotRows = useMemo((): OgSnapshotRow[] => {
    const source = pastPeak.length > 0 ? pastPeak : chartPlayers;
    return source.slice(0, 6).map((p) => ({
      name: p.name,
      position,
      team: p.team,
      stat: p.ppg,
      statLabel: "PPG",
    }));
  }, [pastPeak, chartPlayers, position]);

  const open = (p: AgingPlayer) =>
    openPlayer({
      playerId: p.player_id,
      slug: slugify(p.name),
      name: p.name,
      position,
      team: p.team,
    });

  if (q.isPending) {
    return <PanelAgentLoading agent={agent} />;
  }

  if (q.isError) {
    const gate = ProGateFromPanelError({ panel, error: q.error });
    if (gate) return gate;
    const err = q.error as Error;
    return <p className="p-6 text-red">something fumbled: {err.message}</p>;
  }

  const seasons = q.data?.available_seasons ?? [];
  const activeSeason = season || q.data?.season;

  return (
    <div className="aging-curves-panel">
      <PanelAgentHeader agent={agent} slug={panel.slug} />

      <FormulaPanelBar selected={formula} onSelect={setFormula} panelSlug={panel.slug} />

      {formula && statsQ.isFetching && (
        <p className="text-ink-medium mb-2 text-xs" style={{ fontFamily: "var(--font-hand)" }}>
          pulling composite scores…
        </p>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by position">
          {POSITIONS.map((pos) => (
            <button
              key={pos}
              type="button"
              role="tab"
              aria-selected={position === pos}
              className={`btn-chunky text-sm${position === pos ? " bg-orange text-white" : ""}`}
              onClick={() => setPosition(pos)}
            >
              {pos}
            </button>
          ))}
        </div>
        {seasons.length > 1 && (
          <select
            className="chunky bg-bg-card px-3 py-1 text-sm"
            value={activeSeason ?? ""}
            onChange={(e) => setSeason(e.target.value ? Number(e.target.value) : "")}
            aria-label="Season"
          >
            {seasons.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}
      </div>

      {activeSeason && (
        <p className="text-ink-medium mb-4 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {activeSeason} season ·{" "}
          {formula ? `${formula.name} composite dots + past-peak sort` : "baseline curve + current player dots"}
        </p>
      )}

      {!posData?.curve?.length ? (
        <div className="p-6">
          <p className="text-ink-medium">{agent.emptyCopy}</p>
          <footer className="mt-4 flex flex-wrap items-center gap-4">
            <LabOgExportLink
              slug="aging"
              downloadName="razzle-aging-curves.png"
              position={position}
              snapshotRows={AGING_SAMPLE_OG_ROWS}
              label="export sample card"
            />
          </footer>
        </div>
      ) : (
        <>
          <AgingChart
            curve={posData.curve}
            players={chartPlayers}
            peakAge={peakAge}
            color={POS_COLORS[position]}
            onPlayerClick={open}
          />

          {pastPeak.length > 0 && (
            <section className="mt-6">
              <h3 className="mb-2 text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>
                Past peak ({position})
              </h3>
              <p className="text-ink-medium mb-3 text-sm">
                Still producing but age {">"} {peakAge} — dynasty sell-window candidates.
              </p>
              <div className="table-wrap chunky bg-bg-card overflow-x-auto">
                <table className="screener-table">
                  <thead className="thead-shadow">
                    <tr>
                      <th>Player</th>
                      <th className="text-right">Age</th>
                      <th className="text-right">PPG</th>
                      {formula && <th className="text-right">{formula.name}</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {pastPeak.map((p) => (
                      <tr key={p.player_id} className="screener-row">
                        <td>
                          <button
                            type="button"
                            className="text-left font-bold underline-offset-2 hover:underline"
                            onClick={() => open(p)}
                          >
                            {p.name}
                          </button>{" "}
                          <span className="text-ink-medium text-xs">{p.team}</span>
                        </td>
                        <td className="text-right" style={{ fontFamily: "var(--font-mono)" }}>
                          {p.age}
                        </td>
                        <td className="text-right" style={{ fontFamily: "var(--font-mono)" }}>
                          {p.ppg}
                        </td>
                        {formula && (
                          <td className="text-orange text-right font-bold" style={{ fontFamily: "var(--font-mono)" }}>
                            {p.formula_score != null ? p.formula_score.toFixed(1) : "—"}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}

      {top && peakAge != null && (
        <footer className="mt-6 flex flex-wrap items-center gap-4 border-t border-ink pt-4">
          <Link
            href={
              toRoom({
                agentId: "octo",
                panelSlug: "aging",
                question: formula
                  ? `${position}s peak around age ${peakAge}. ${top.name} leads ${formula.name} (${top.formula_score?.toFixed(1) ?? "?"}) at age ${top.age} — sell window or hold?`
                  : `${position}s peak around age ${peakAge}. ${top.name} is ${top.age} at ${top.ppg} PPG — sell window or hold?`,
              }) as Route
            }
            className="text-sm text-orange underline"
          >
            Ask Octo about {position} aging →
          </Link>
          <LabOgExportLink
            slug="aging"
            downloadName="razzle-aging-curves.png"
            position={position}
            snapshotRows={ogSnapshotRows}
          />
        </footer>
      )}
    </div>
  );
}
