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
import { PanelAgentHeader, PanelAgentLoading, panelAgent } from "../PanelAgentHeader";
import { ProGateFromPanelError } from "../ProGateFromPanelError";
import { LabOgExportLink, type OgSnapshotRow } from "../LabOgExportLink";

const POSITIONS = ["", "QB", "RB", "WR", "TE"] as const;

/** Sample RBS board when breakouts API returns zero candidates — OG still screenshots. */
const BREAKOUTS_SAMPLE_OG_ROWS: OgSnapshotRow[] = [
  { name: "Rome Odunze", position: "WR", team: "CHI", stat: 92, statLabel: "RBS" },
  { name: "Ladd McConkey", position: "WR", team: "LAC", stat: 88, statLabel: "RBS" },
  { name: "Marvin Harrison Jr.", position: "WR", team: "ARI", stat: 85, statLabel: "RBS" },
  { name: "Malik Nabers", position: "WR", team: "NYG", stat: 81, statLabel: "RBS" },
  { name: "Brian Thomas Jr.", position: "WR", team: "JAX", stat: 78, statLabel: "RBS" },
  { name: "Xavier Worthy", position: "WR", team: "KC", stat: 74, statLabel: "RBS" },
];

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
    const ranked = [...candidates].sort((a, b) => {
      const aScore = formula && a.formula_score != null ? a.formula_score : (a.rbs_score ?? 0);
      const bScore = formula && b.formula_score != null ? b.formula_score : (b.rbs_score ?? 0);
      return bScore - aScore;
    });
    return ranked.slice(0, 6).map((p) => ({
      name: p.name,
      position: p.position,
      team: p.team,
      stat:
        formula && p.formula_score != null
          ? p.formula_score
          : (p.rbs_score ?? 0),
      statLabel,
    }));
  }, [candidates, formula]);

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
        <div className="p-6">
          <p className="text-ink-medium">{agent.emptyCopy}</p>
          <footer className="mt-4 flex flex-wrap items-center gap-4">
            <LabOgExportLink
              slug="breakouts"
              downloadName="razzle-breakouts.png"
              position={position || undefined}
              snapshotRows={BREAKOUTS_SAMPLE_OG_ROWS}
              label="export sample card"
            />
          </footer>
        </div>
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
