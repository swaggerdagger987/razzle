"use client";

import type { PanelDefinition } from "@razzle/panels";
import { PositionPill } from "@razzle/ui";
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

const POSITIONS = ["", "QB", "RB", "WR", "TE"] as const;

/** Sample PPO board when the API returns no rows — OG export still screenshots. */
const EFFICIENCY_SAMPLE_OG_ROWS: OgSnapshotRow[] = [
  { name: "Bijan Robinson", position: "RB", team: "ATL", stat: 0.82, statLabel: "PPO" },
  { name: "Christian McCaffrey", position: "RB", team: "SF", stat: 0.79, statLabel: "PPO" },
  { name: "Ja'Marr Chase", position: "WR", team: "CIN", stat: 0.76, statLabel: "PPO" },
  { name: "Justin Jefferson", position: "WR", team: "MIN", stat: 0.74, statLabel: "PPO" },
  { name: "Travis Kelce", position: "TE", team: "KC", stat: 0.71, statLabel: "PPO" },
  { name: "Josh Allen", position: "QB", team: "BUF", stat: 0.68, statLabel: "PPO" },
];

interface EfficiencyPlayer extends WithFormulaScore {
  player_id: string;
  name: string;
  position: string;
  team: string;
  ppg?: number;
  games?: number;
  opportunities?: number;
  touches?: number;
  ppo?: number;
  yards_per_touch?: number;
  grade?: string;
  annotation?: string;
}

interface EfficiencyData {
  season?: number;
  most_efficient?: EfficiencyPlayer[];
  volume_kings?: EfficiencyPlayer[];
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function PlayerTable({
  title,
  players,
  onOpen,
  formulaName,
}: {
  title: string;
  players: EfficiencyPlayer[];
  onOpen: (p: EfficiencyPlayer) => void;
  formulaName?: string;
}) {
  if (!players.length) return null;
  return (
    <section className="mb-8">
      <h3 className="mb-3 text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>
        {title}
      </h3>
      <div className="table-wrap chunky bg-bg-card overflow-x-auto">
        <table className="screener-table">
          <thead className="thead-shadow">
            <tr>
              <th>Player</th>
              <th className="text-right">PPG</th>
              <th className="text-right">PPO</th>
              <th className="text-right">Y/T</th>
              {formulaName && (
                <th className="text-right" title={formulaName}>
                  {formulaName}
                </th>
              )}
              <th className="text-right">Grade</th>
            </tr>
          </thead>
          <tbody>
            {players.slice(0, 25).map((p) => (
              <tr key={p.player_id} className="screener-row">
                <td>
                  <button
                    type="button"
                    className="text-left font-bold underline-offset-2 hover:underline"
                    onClick={() => onOpen(p)}
                  >
                    {p.name}
                  </button>{" "}
                  <PositionPill position={p.position as "QB" | "RB" | "WR" | "TE"} />
                  <span className="text-ink-medium ml-1 text-xs">{p.team}</span>
                  {p.annotation && (
                    <p className="text-orange text-xs" style={{ fontFamily: "var(--font-hand)" }}>
                      {p.annotation}
                    </p>
                  )}
                </td>
                <td className="text-right" style={{ fontFamily: "var(--font-mono)" }}>
                  {p.ppg?.toFixed(2) ?? "—"}
                </td>
                <td className="text-right" style={{ fontFamily: "var(--font-mono)" }}>
                  {p.ppo?.toFixed(2) ?? "—"}
                </td>
                <td className="text-right" style={{ fontFamily: "var(--font-mono)" }}>
                  {p.yards_per_touch?.toFixed(2) ?? "—"}
                </td>
                {formulaName && (
                  <td className="text-right text-orange font-bold" style={{ fontFamily: "var(--font-mono)" }}>
                    {p.formula_score != null ? p.formula_score.toFixed(1) : "—"}
                  </td>
                )}
                <td className="text-right font-bold">{p.grade ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

interface Props {
  panel: PanelDefinition;
}

export function EfficiencyRenderer({ panel }: Props) {
  const { openPlayer } = usePlayerSheet();
  const [position, setPosition] = useState<(typeof POSITIONS)[number]>("RB");
  const [formula, setFormula] = useState<SavedFormula | null>(null);
  const agent = panelAgent(panel.slug);

  const q = useQuery({
    queryKey: ["panel", panel.slug, position],
    queryFn: async () => {
      const qs = position ? `?position=${position}&limit=30` : "?limit=30";
      const res = await fetch(`/api/panels/${panel.slug}${qs}`);
      if (res.status === 402) {
        const body = await res.json().catch(() => ({}));
        const detail = (body as { detail?: Record<string, string> }).detail ?? {};
        throw Object.assign(new Error(detail.message ?? "Pro plan required"), {
          upgrade: detail,
        });
      }
      if (!res.ok) throw new Error(`API ${res.status}`);
      return res.json() as Promise<EfficiencyData>;
    },
  });

  const rawEfficient = q.data?.most_efficient ?? [];
  const rawVolume = q.data?.volume_kings ?? [];
  const playerIds = useMemo(
    () => [...new Set([...rawEfficient, ...rawVolume].map((p) => p.player_id))],
    [rawEfficient, rawVolume],
  );

  const statsQ = useQuery({
    queryKey: ["panel-formula-stats", panel.slug, q.data?.season, playerIds, formula?.name],
    queryFn: () => fetchPlayerStatsForFormula(playerIds, q.data?.season ?? 0),
    enabled: Boolean(formula && playerIds.length),
  });

  const efficient = useMemo(() => {
    if (!formula || !statsQ.data) return rawEfficient;
    return sortPlayersByFormula(rawEfficient, statsQ.data, formula);
  }, [formula, rawEfficient, statsQ.data]);

  const volume = useMemo(() => {
    if (!formula || !statsQ.data) return rawVolume;
    return sortPlayersByFormula(rawVolume, statsQ.data, formula);
  }, [formula, rawVolume, statsQ.data]);

  const top = efficient[0] ?? volume[0] ?? null;

  const ogSnapshotRows = useMemo((): OgSnapshotRow[] => {
    return efficient.slice(0, 6).map((p) => ({
      name: p.name,
      position: p.position,
      team: p.team,
      stat: formula && p.formula_score != null ? p.formula_score : (p.ppo ?? 0),
      statLabel: formula && p.formula_score != null ? "Score" : "PPO",
    }));
  }, [efficient, formula]);

  const open = (p: EfficiencyPlayer) =>
    openPlayer({
      playerId: p.player_id,
      slug: slugify(p.name),
      name: p.name,
      position: p.position,
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

  return (
    <div className="efficiency-panel">
      <PanelAgentHeader agent={agent} slug={panel.slug} />

      <FormulaPanelBar selected={formula} onSelect={setFormula} panelSlug={panel.slug} />

      {formula && statsQ.isFetching && (
        <p className="text-ink-medium mb-2 text-xs" style={{ fontFamily: "var(--font-hand)" }}>
          pulling composite scores…
        </p>
      )}

      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Filter by position">
        {POSITIONS.map((pos) => (
          <button
            key={pos || "ALL"}
            type="button"
            role="tab"
            aria-selected={position === pos}
            className={`btn-chunky text-sm${position === pos ? " bg-orange text-white" : ""}`}
            onClick={() => setPosition(pos)}
          >
            {pos || "All"}
          </button>
        ))}
      </div>

      {q.data?.season && (
        <p className="text-ink-medium mb-4 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {q.data.season} season · PPO = fantasy points per opportunity
        </p>
      )}

      {!efficient.length && !volume.length ? (
        <div className="p-6">
          <p className="text-ink-medium">{agent.emptyCopy}</p>
          <footer className="mt-4 flex flex-wrap items-center gap-4">
            <LabOgExportLink
              slug="efficiency"
              downloadName="razzle-efficiency.png"
              position={position || undefined}
              snapshotRows={EFFICIENCY_SAMPLE_OG_ROWS}
              label="export sample card"
            />
          </footer>
        </div>
      ) : (
        <>
          <PlayerTable
            title={formula ? `Most efficient · sorted by ${formula.name}` : "Most efficient"}
            players={efficient}
            onOpen={open}
            formulaName={formula?.name}
          />
          <PlayerTable
            title={formula ? `Volume kings · sorted by ${formula.name}` : "Volume kings"}
            players={volume}
            onOpen={open}
            formulaName={formula?.name}
          />
        </>
      )}

      {top && (
        <footer className="mt-6 flex flex-wrap items-center gap-4 border-t border-ink pt-4">
          <Link
            href={
              toRoom({
                agentId: "octo",
                panelSlug: "efficiency",
                question: formula
                  ? `${top.name} leads ${formula.name} (${top.formula_score?.toFixed(1) ?? "?"}) but grades ${top.grade ?? "?"} on efficiency — volume play or true efficiency edge?`
                  : `${top.name} grades ${top.grade ?? "?"} on efficiency — ${top.ppo?.toFixed(2) ?? "?"} PPO. Worth rostering for efficiency or just volume?`,
              }) as Route
            }
            className="text-sm text-orange underline"
          >
            Ask Octo about {top.name} →
          </Link>
          <LabOgExportLink
            slug="efficiency"
            downloadName="razzle-efficiency.png"
            position={position || undefined}
            snapshotRows={ogSnapshotRows}
          />
        </footer>
      )}
    </div>
  );
}
