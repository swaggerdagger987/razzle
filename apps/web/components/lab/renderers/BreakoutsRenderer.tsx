"use client";

import type { PanelDefinition } from "@razzle/panels";
import { PositionPill } from "@razzle/ui";
import { toRoom } from "@razzle/hallway";
import Link from "next/link";
import type { Route } from "next";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { isUpgradeRequiredError } from "@/lib/panel-api";
import type { SavedFormula } from "@/lib/formulas";
import {
  fetchPlayerStatsForFormula,
  sortPlayersByFormula,
  type WithFormulaScore,
} from "@/lib/panel-formula-sort";
import { usePlayerSheet } from "@/lib/player-sheet-context";
import { FormulaPanelBar } from "../FormulaPanelBar";
import { PanelAgentHeader, PanelAgentLoading, panelAgent } from "../PanelAgentHeader";
import { ProUpgradeGate } from "../ProUpgradeGate";
import { LabOgExportLink, type OgSnapshotRow } from "../LabOgExportLink";

const POSITIONS = ["", "QB", "RB", "WR", "TE"] as const;

interface Candidate extends WithFormulaScore {
  player_id: string;
  name: string;
  position: string;
  team: string;
  age?: number | null;
  ppg?: number;
  snap_pct?: number;
  target_share?: number;
  opportunity_pct?: number;
  production_pct?: number;
  rbs_score?: number;
  rank?: number;
  annotation?: string;
}

interface BreakoutsData {
  candidates?: Candidate[];
  total?: number;
  season?: number;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

interface Props {
  panel: PanelDefinition;
}

export function BreakoutsRenderer({ panel }: Props) {
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
      return res.json() as Promise<BreakoutsData>;
    },
  });

  const rawCandidates = q.data?.candidates ?? [];
  const playerIds = useMemo(
    () => rawCandidates.map((p) => p.player_id),
    [rawCandidates],
  );

  const statsQ = useQuery({
    queryKey: ["panel-formula-stats", panel.slug, q.data?.season, playerIds, formula?.name],
    queryFn: () => fetchPlayerStatsForFormula(playerIds, q.data?.season ?? 0),
    enabled: Boolean(formula && playerIds.length),
  });

  const candidates = useMemo(() => {
    if (!formula || !statsQ.data) return rawCandidates;
    return sortPlayersByFormula(rawCandidates, statsQ.data, formula);
  }, [formula, rawCandidates, statsQ.data]);

  const top = candidates[0] ?? null;

  const ogSnapshotRows = useMemo((): OgSnapshotRow[] => {
    const statLabel = formula?.name ?? "RBS";
    const scoreFor = (p: Candidate) =>
      formula && p.formula_score != null ? p.formula_score : (p.rbs_score ?? 0);
    const ranked = [...candidates].sort((a, b) => scoreFor(b) - scoreFor(a));
    return ranked.slice(0, 6).map((p) => ({
      name: p.name,
      position: p.position,
      team: p.team,
      stat: scoreFor(p),
      statLabel,
    }));
  }, [candidates, formula]);

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
    <div className="breakouts-panel">
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
          {q.data.total ?? 0} candidates · {q.data.season} · ages ≤27 · gap = opportunity − production
        </p>
      )}

      {!candidates.length ? (
        <p className="text-ink-medium p-6">{agent.emptyCopy}</p>
      ) : (
        <div className="panel-cards">
          {candidates.slice(0, 40).map((p) => {
            const gap = (p.opportunity_pct ?? 0) - (p.production_pct ?? 0);
            return (
              <article key={p.player_id} className="panel-card chunky bg-bg-card p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="text-ink-medium text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                    #{p.rank ?? "—"}
                  </span>
                  <button
                    type="button"
                    className="text-left text-lg font-bold underline-offset-2 hover:underline"
                    style={{ fontFamily: "var(--font-display)" }}
                    onClick={() =>
                      openPlayer({
                        playerId: p.player_id,
                        slug: slugify(p.name),
                        name: p.name,
                        position: p.position,
                        team: p.team,
                      })
                    }
                  >
                    {p.name}
                  </button>
                  <PositionPill position={p.position as "QB" | "RB" | "WR" | "TE"} />
                  <span className="text-ink-medium text-xs">{p.team}</span>
                  {p.age != null && (
                    <span className="text-ink-medium text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                      {Number(p.age).toFixed(1)}y
                    </span>
                  )}
                </div>
                <p className="text-orange mb-2 text-sm font-bold" style={{ fontFamily: "var(--font-hand)" }}>
                  {p.annotation ?? "on the radar"}
                </p>
                <dl className="panel-card-stats grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                  {formula && (
                    <div>
                      <dt className="text-ink-medium text-xs">{formula.name}</dt>
                      <dd className="text-orange font-bold" style={{ fontFamily: "var(--font-mono)" }}>
                        {p.formula_score != null ? p.formula_score.toFixed(1) : "—"}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-ink-medium text-xs">RBS score</dt>
                    <dd className="font-bold" style={{ fontFamily: "var(--font-mono)" }}>
                      {p.rbs_score != null ? p.rbs_score.toFixed(1) : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ink-medium text-xs">PPG</dt>
                    <dd style={{ fontFamily: "var(--font-mono)" }}>{p.ppg != null ? p.ppg.toFixed(2) : "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-medium text-xs">Opp / Prod</dt>
                    <dd style={{ fontFamily: "var(--font-mono)" }}>
                      {p.opportunity_pct ?? "—"} / {p.production_pct ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ink-medium text-xs">Gap</dt>
                    <dd className="text-teal font-bold" style={{ fontFamily: "var(--font-mono)" }}>
                      +{gap}
                    </dd>
                  </div>
                </dl>
              </article>
            );
          })}
        </div>
      )}

      {top && (
        <footer className="mt-6 flex flex-wrap items-center gap-4 border-t border-ink pt-4">
          <Link
            href={
              toRoom({
                agentId: "hawkeye",
                panelSlug: "breakouts",
                question: formula
                  ? `${top.name} leads ${formula.name} (${top.formula_score?.toFixed(1) ?? "?"}) on breakouts — RBS ${top.rbs_score?.toFixed(1) ?? "?"} still valid?`
                  : `Is ${top.name} a real breakout candidate? Opportunity vs production says RBS ${top.rbs_score?.toFixed(1) ?? "?"}.`,
              }) as Route
            }
            className="text-sm text-orange underline"
          >
            Ask Hawkeye about {top.name} →
          </Link>
          <LabOgExportLink
            slug="breakouts"
            downloadName="razzle-breakouts.png"
            position={position || undefined}
            snapshotRows={ogSnapshotRows}
          />
        </footer>
      )}
    </div>
  );
}
