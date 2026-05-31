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
import { isUpgradeRequiredError } from "@/lib/panel-api";
import { usePlayerSheet } from "@/lib/player-sheet-context";
import { FormulaPanelBar } from "../FormulaPanelBar";
import { LabOgExportLink, type OgSnapshotRow } from "../LabOgExportLink";
import { PanelAgentHeader, PanelAgentLoading, panelAgent } from "../PanelAgentHeader";
import { ProUpgradeGate } from "../ProUpgradeGate";

const POSITIONS = ["", "QB", "RB", "WR", "TE"] as const;

const POS_COLORS: Record<string, string> = {
  QB: "#5b7fff",
  RB: "#2ec4b6",
  WR: "#d97757",
  TE: "#8b5cf6",
};

interface PlayerRow extends WithFormulaScore {
  player_id: string;
  full_name: string;
  position: string;
  team: string;
  age?: number | null;
  trade_value?: number;
  tier_label?: string;
  rank?: number;
}

interface ChartData {
  players?: PlayerRow[];
  total?: number;
  season?: number;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

interface Props {
  panel: PanelDefinition;
}

export function TradeValuesRenderer({ panel }: Props) {
  const { openPlayer } = usePlayerSheet();
  const [position, setPosition] = useState<(typeof POSITIONS)[number]>("");
  const [formula, setFormula] = useState<SavedFormula | null>(null);
  const agent = panelAgent(panel.slug);

  const q = useQuery({
    queryKey: ["panel", panel.slug, position],
    queryFn: async () => {
      const qs = position ? `?position=${position}` : "";
      const res = await fetch(`/api/panels/${panel.slug}${qs}`);
      if (res.status === 402) {
        const body = await res.json().catch(() => ({}));
        const detail = (body as { detail?: Record<string, string> }).detail ?? {};
        throw Object.assign(new Error(detail.message ?? "Pro plan required"), {
          upgrade: detail,
        });
      }
      if (!res.ok) throw new Error(`API ${res.status}`);
      return res.json() as Promise<ChartData>;
    },
  });

  const rawPlayers = q.data?.players ?? [];
  const playerIds = useMemo(() => rawPlayers.map((p) => p.player_id), [rawPlayers]);

  const statsQ = useQuery({
    queryKey: ["panel-formula-stats", panel.slug, q.data?.season, playerIds, formula?.name],
    queryFn: () => fetchPlayerStatsForFormula(playerIds, q.data?.season ?? 0),
    enabled: Boolean(formula && playerIds.length),
  });

  const players = useMemo(() => {
    if (!formula || !statsQ.data) return rawPlayers;
    return sortPlayersByFormula(rawPlayers, statsQ.data, formula);
  }, [formula, rawPlayers, statsQ.data]);

  const maxVal = useMemo(() => {
    if (formula) {
      return Math.max(...players.map((p) => p.formula_score ?? 0), 1);
    }
    return Math.max(...players.map((p) => p.trade_value ?? 0), 1);
  }, [formula, players]);

  const topPlayer = players[0] ?? null;

  const ogSnapshotRows = useMemo((): OgSnapshotRow[] => {
    const statLabel = formula?.name ?? "Value";
    return players.slice(0, 6).map((p) => ({
      name: p.full_name,
      position: p.position,
      team: p.team,
      stat:
        formula && p.formula_score != null
          ? p.formula_score
          : (p.trade_value ?? 0),
      statLabel,
    }));
  }, [players, formula]);

  if (q.isPending) {
    return <PanelAgentLoading agent={agent} />;
  }

  if (q.isError) {
    const err = q.error as Error & { upgrade?: { required?: string; current?: string; message?: string } };
    if (err.upgrade) {
      return (
        <ProUpgradeGate
          panelSlug={panel.slug}
          panelTitle={panel.title}
          required={err.upgrade.required ?? "pro"}
          current={err.upgrade.current ?? "free"}
          message={err.upgrade.message}
        />
      );
    }
    if (isUpgradeRequiredError(err)) {
      return (
        <ProUpgradeGate
          panelSlug={panel.slug}
          panelTitle={panel.title}
          required={err.required}
          current={err.current}
          message={err.message}
        />
      );
    }
    return <p className="p-6 text-red">something fumbled: {err.message}</p>;
  }

  return (
    <div className="trade-values">
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
          {q.data.total ?? 0} players · {q.data.season} ·{" "}
          {formula ? `${formula.name} composite bars` : "production + age + scarcity"}
        </p>
      )}

      {!players.length ? (
        <p className="text-ink-medium p-6">{agent.emptyCopy}</p>
      ) : (
        <div className="chart-panel chunky bg-bg-card p-4">
          {players.slice(0, 40).map((p, i) => {
            const val = formula ? (p.formula_score ?? 0) : (p.trade_value ?? 0);
            const pct = (val / maxVal) * 100;
            const color = POS_COLORS[p.position] ?? "#d97757";
            return (
              <div key={p.player_id} className="chart-bar-row mb-2 flex items-center gap-2">
                <span className="chart-bar-label w-6 text-xs text-ink-medium" style={{ fontFamily: "var(--font-mono)" }}>
                  {formula ? i + 1 : (p.rank ?? "—")}
                </span>
                <button
                  type="button"
                  className="chart-bar-label w-36 truncate text-left text-sm font-bold hover:underline"
                  onClick={() =>
                    openPlayer({
                      playerId: p.player_id,
                      slug: slugify(p.full_name),
                      name: p.full_name,
                      position: p.position,
                      team: p.team,
                    })
                  }
                >
                  {p.full_name}
                </button>
                <PositionPill position={p.position as "QB" | "RB" | "WR" | "TE"} />
                <div className="chart-bar-track min-w-0 flex-1">
                  <div
                    className="chart-bar-fill h-5"
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>
                <span className="chart-bar-value w-12 text-right text-sm font-bold" style={{ fontFamily: "var(--font-mono)" }}>
                  {val.toFixed(1)}
                </span>
                {!formula && p.tier_label && (
                  <span className="hidden text-xs text-ink-medium sm:inline">{p.tier_label}</span>
                )}
                {formula && p.trade_value != null && (
                  <span className="hidden text-xs text-ink-medium sm:inline" style={{ fontFamily: "var(--font-mono)" }}>
                    tv {p.trade_value.toFixed(0)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {topPlayer && (
        <footer className="mt-6 flex flex-wrap items-center gap-4 border-t border-ink pt-4">
          <Link
            href={
              toRoom({
                agentId: "bones",
                panelSlug: "tradevalues",
                question: formula
                  ? `${topPlayer.full_name} leads ${formula.name} (${topPlayer.formula_score?.toFixed(1) ?? "?"}) but trade value is ${topPlayer.trade_value?.toFixed(1) ?? "?"} — buy low or overpriced?`
                  : `Would you trade ${topPlayer.full_name} in dynasty? What's fair value?`,
              }) as Route
            }
            className="text-sm text-orange underline"
          >
            Ask Bones about {topPlayer.full_name} →
          </Link>
          <LabOgExportLink
            slug="tradevalues"
            downloadName="razzle-trade-values.png"
            snapshotRows={ogSnapshotRows}
          />
        </footer>
      )}
    </div>
  );
}
