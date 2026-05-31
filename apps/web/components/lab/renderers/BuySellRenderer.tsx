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
import { PanelAgentHeader, PanelAgentLoading, panelAgent } from "../PanelAgentHeader";
import { LabOgExportLink, type OgSnapshotRow } from "../LabOgExportLink";
import { ProUpgradeGate } from "../ProUpgradeGate";

const POSITIONS = ["", "QB", "RB", "WR", "TE"] as const;

interface Candidate extends WithFormulaScore {
  player_id: string;
  name: string;
  position: string;
  team: string;
  age?: number | null;
  ppg?: number;
  dynasty_value?: number;
  dynasty_rank_pct?: number;
  efficiency_pct?: number;
  efficiency_grade?: string;
  mismatch_score?: number;
  eff_stats?: Record<string, number>;
  rank?: number;
  annotation?: string;
}

interface BuySellData {
  season?: number;
  available_seasons?: number[];
  buy_low?: Candidate[];
  sell_high?: Candidate[];
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function CandidateCard({
  player,
  side,
  rank,
  formula,
  onOpen,
}: {
  player: Candidate;
  side: "buy" | "sell";
  rank: number;
  formula: SavedFormula | null;
  onOpen: (p: Candidate) => void;
}) {
  return (
    <article className={`chunky bg-bg-card p-4 ${side === "buy" ? "border-teal" : "border-orange"}`}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <button
            type="button"
            className="text-left text-lg font-bold underline-offset-2 hover:underline"
            style={{ fontFamily: "var(--font-display)" }}
            onClick={() => onOpen(player)}
          >
            #{rank} {player.name}
          </button>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <PositionPill position={player.position as "QB" | "RB" | "WR" | "TE"} />
            <span className="text-ink-medium text-xs">{player.team}</span>
            {player.age != null && (
              <span className="text-ink-light text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                age {player.age}
              </span>
            )}
          </div>
        </div>
        <span
          className={`rounded px-2 py-0.5 text-xs font-bold ${side === "buy" ? "bg-teal text-white" : "bg-orange text-white"}`}
        >
          {player.efficiency_grade ?? "—"}
        </span>
      </div>
      <dl className="mb-2 grid grid-cols-3 gap-2 text-xs" style={{ fontFamily: "var(--font-mono)" }}>
        {formula && (
          <div>
            <dt className="text-ink-light">{formula.name}</dt>
            <dd className="text-orange font-bold">
              {player.formula_score != null ? player.formula_score.toFixed(1) : "—"}
            </dd>
          </div>
        )}
        <div>
          <dt className="text-ink-light">PPG</dt>
          <dd className="font-bold">{player.ppg?.toFixed(1) ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-ink-light">Eff %</dt>
          <dd className="font-bold">{player.efficiency_pct ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-ink-light">Rank %</dt>
          <dd className="font-bold">{player.dynasty_rank_pct ?? "—"}</dd>
        </div>
      </dl>
      {player.annotation && (
        <p className="text-orange text-sm" style={{ fontFamily: "var(--font-hand)" }}>
          {player.annotation}
        </p>
      )}
    </article>
  );
}

interface Props {
  panel: PanelDefinition;
}

export function BuySellRenderer({ panel }: Props) {
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
        throw Object.assign(new Error(detail.message ?? "Pro plan required"), { upgrade: detail });
      }
      if (!res.ok) throw new Error(`API ${res.status}`);
      return res.json() as Promise<BuySellData>;
    },
  });

  const rawBuy = q.data?.buy_low ?? [];
  const rawSell = q.data?.sell_high ?? [];
  const playerIds = useMemo(
    () => [...rawBuy, ...rawSell].map((p) => p.player_id),
    [rawBuy, rawSell],
  );

  const statsQ = useQuery({
    queryKey: ["panel-formula-stats", panel.slug, q.data?.season, playerIds, formula?.name],
    queryFn: () => fetchPlayerStatsForFormula(playerIds, q.data?.season ?? 0),
    enabled: Boolean(formula && playerIds.length),
  });

  const buyLow = useMemo(() => {
    if (!formula || !statsQ.data) return rawBuy;
    return sortPlayersByFormula(rawBuy, statsQ.data, formula);
  }, [formula, rawBuy, statsQ.data]);

  const sellHigh = useMemo(() => {
    if (!formula || !statsQ.data) return rawSell;
    return [...sortPlayersByFormula(rawSell, statsQ.data, formula)].reverse();
  }, [formula, rawSell, statsQ.data]);

  const topBuy = buyLow[0] ?? null;
  const topSell = sellHigh[0] ?? null;

  const ogSnapshotRows = useMemo((): OgSnapshotRow[] => {
    const statFor = (p: Candidate) =>
      formula && p.formula_score != null
        ? p.formula_score
        : Number(p.efficiency_pct ?? p.dynasty_rank_pct ?? 0);
    const buyLabel = formula ? `Buy · ${formula.name}` : "Buy";
    const sellLabel = formula ? `Sell · ${formula.name}` : "Sell";
    const buyRows = buyLow.slice(0, 3).map((p) => ({
      name: p.name,
      position: p.position,
      team: p.team,
      stat: statFor(p),
      statLabel: buyLabel,
    }));
    const sellRows = sellHigh.slice(0, 3).map((p) => ({
      name: p.name,
      position: p.position,
      team: p.team,
      stat: statFor(p),
      statLabel: sellLabel,
    }));
    return [...buyRows, ...sellRows].slice(0, 6);
  }, [buyLow, sellHigh, formula]);

  const open = (p: Candidate) =>
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
        <ProUpgradeGate panelSlug={panel.slug} panelTitle={panel.title} required={err.required} current={err.current} message={err.message} />
      );
    }
    return <p className="p-6 text-red">something fumbled: {err.message}</p>;
  }

  return (
    <div className="buy-sell-panel">
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
          {q.data.season} season ·{" "}
          {formula ? `${formula.name} composite sort` : "buy when efficiency beats rank · sell when rank beats tape"}
        </p>
      )}

      {!buyLow.length && !sellHigh.length ? (
        <p className="text-ink-medium p-6">{agent.emptyCopy}</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <section>
            <h3 className="mb-3 text-lg font-bold text-teal" style={{ fontFamily: "var(--font-display)" }}>
              Buy low
            </h3>
            <div className="flex flex-col gap-3">
              {buyLow.map((p, i) => (
                <CandidateCard
                  key={p.player_id}
                  player={p}
                  side="buy"
                  rank={formula ? i + 1 : (p.rank ?? i + 1)}
                  formula={formula}
                  onOpen={open}
                />
              ))}
            </div>
          </section>
          <section>
            <h3 className="mb-3 text-lg font-bold text-orange" style={{ fontFamily: "var(--font-display)" }}>
              Sell high
            </h3>
            <div className="flex flex-col gap-3">
              {sellHigh.map((p, i) => (
                <CandidateCard
                  key={p.player_id}
                  player={p}
                  side="sell"
                  rank={formula ? i + 1 : (p.rank ?? i + 1)}
                  formula={formula}
                  onOpen={open}
                />
              ))}
            </div>
          </section>
        </div>
      )}

      {(topBuy || topSell) && (
        <footer className="mt-6 flex flex-wrap items-center gap-4 border-t border-ink pt-4">
          {topBuy && (
            <Link
              href={
                toRoom({
                  agentId: "bones",
                  panelSlug: "buysell",
                  question: formula
                    ? `${topBuy.name} leads ${formula.name} (${topBuy.formula_score?.toFixed(1) ?? "?"}) in buy-low but ranks ${topBuy.dynasty_rank_pct}th percentile — composite vs market mismatch?`
                    : `${topBuy.name} grades ${topBuy.efficiency_grade} on efficiency but ranks ${topBuy.dynasty_rank_pct}th percentile — buy low before the market catches up?`,
                }) as Route
              }
              className="text-sm text-teal underline"
            >
              Ask Bones about {topBuy.name} (buy) →
            </Link>
          )}
          {topSell && (
            <Link
              href={
                toRoom({
                  agentId: "bones",
                  panelSlug: "buysell",
                  question: formula
                    ? `${topSell.name} ranks ${topSell.dynasty_rank_pct}th percentile but ${formula.name} is ${topSell.formula_score?.toFixed(1) ?? "?"} — sell high before composite catches up?`
                    : `${topSell.name} ranks ${topSell.dynasty_rank_pct}th percentile but efficiency is ${topSell.efficiency_grade} — sell high window?`,
                }) as Route
              }
              className="text-sm text-orange underline"
            >
              Ask Bones about {topSell.name} (sell) →
            </Link>
          )}
          <LabOgExportLink
            slug="buysell"
            downloadName="razzle-buy-sell.png"
            position={position || undefined}
            snapshotRows={ogSnapshotRows}
          />
        </footer>
      )}
    </div>
  );
}
