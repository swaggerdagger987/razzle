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
import { ProUpgradeGate } from "../ProUpgradeGate";
import { LabOgExportLink, type OgSnapshotRow } from "../LabOgExportLink";

const POSITIONS = ["", "QB", "RB", "WR", "TE"] as const;

interface PlayerRow extends WithFormulaScore {
  player_id: string;
  full_name: string;
  position: string;
  team: string;
  age?: number | null;
  ppg?: number;
  dynasty_value?: number;
  tier_label?: string;
}

interface TierBlock {
  tier: number;
  label: string;
  players: PlayerRow[];
}

interface RankingsData {
  players?: PlayerRow[];
  tiers?: TierBlock[];
  total?: number;
  season?: number;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

interface Props {
  panel: PanelDefinition;
}

function flattenPlayers(data: RankingsData): PlayerRow[] {
  if (data.players?.length) return data.players;
  return (data.tiers ?? []).flatMap((t) => t.players);
}

export function DynastyRankingsRenderer({ panel }: Props) {
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
      return res.json() as Promise<RankingsData>;
    },
  });

  const rawPlayers = useMemo(() => (q.data ? flattenPlayers(q.data) : []), [q.data]);
  const playerIds = useMemo(() => rawPlayers.map((p) => p.player_id), [rawPlayers]);

  const statsQ = useQuery({
    queryKey: ["panel-formula-stats", panel.slug, q.data?.season, playerIds, formula?.name],
    queryFn: () => fetchPlayerStatsForFormula(playerIds, q.data?.season ?? 0),
    enabled: Boolean(formula && playerIds.length),
  });

  const sortedPlayers = useMemo(() => {
    if (!formula || !statsQ.data) return rawPlayers;
    return sortPlayersByFormula(rawPlayers, statsQ.data, formula);
  }, [formula, rawPlayers, statsQ.data]);

  const topPlayer = sortedPlayers[0] ?? null;

  const ogSnapshotRows = useMemo((): OgSnapshotRow[] => {
    const players = formula ? sortedPlayers : rawPlayers;
    const filtered = position ? players.filter((p) => p.position === position) : players;
    return filtered.slice(0, 6).map((p, i) => ({
      name: p.full_name,
      position: p.position,
      team: p.team,
      stat: formula ? (p.formula_score ?? 0) : (p.dynasty_value ?? i + 1),
      statLabel: formula ? "Score" : "Value",
    }));
  }, [formula, sortedPlayers, rawPlayers, position]);

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

  const data = q.data!;
  const tiers = data.tiers ?? [];

  const renderPlayerRow = (p: PlayerRow, rank?: number) => {
    const age = p.age != null ? Number(p.age) : null;
    const durabilityFlag = age != null && age >= 28;
    return (
      <li key={p.player_id} className="flex flex-wrap items-center gap-2 py-1">
        {rank != null && (
          <span className="text-ink-medium text-xs" style={{ fontFamily: "var(--font-mono)" }}>
            #{rank}
          </span>
        )}
        <button
          type="button"
          className="font-bold underline-offset-2 hover:underline"
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
        <span className="text-ink-medium text-xs">{p.team}</span>
        {age != null && (
          <span className="text-ink-medium text-xs" style={{ fontFamily: "var(--font-mono)" }}>
            {age.toFixed(1)}y
          </span>
        )}
        {formula && (
          <span className="text-orange text-xs font-bold" style={{ fontFamily: "var(--font-mono)" }}>
            {p.formula_score != null ? p.formula_score.toFixed(1) : "—"}
          </span>
        )}
        {!formula && (
          <span className="text-orange text-xs font-bold" style={{ fontFamily: "var(--font-mono)" }}>
            {p.dynasty_value != null ? p.dynasty_value.toFixed(1) : "—"}
          </span>
        )}
        {durabilityFlag && (
          <Link
            href={
              toRoom({
                agentId: "dolphin",
                panelSlug: "rankings",
                question: `${p.full_name}: durability and injury risk for dynasty?`,
              }) as Route
            }
            className="text-xs text-purple underline"
            title="Ask Dr. Dolphin about durability"
          >
            durability →
          </Link>
        )}
      </li>
    );
  };

  return (
    <div className="dynasty-rankings">
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

      {data.season && (
        <p className="text-ink-medium mb-4 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {data.total ?? 0} players · {data.season} season ·{" "}
          {formula ? `${formula.name} composite` : "PPR dynasty value"}
        </p>
      )}

      {formula ? (
        !sortedPlayers.length ? (
          <p className="text-ink-medium p-6">{agent.emptyCopy}</p>
        ) : (
          <section className="tier-block chunky bg-bg-card p-4">
            <h3 className="tier-label" style={{ fontFamily: "var(--font-display)" }}>
              Sorted by {formula.name}
            </h3>
            <ul className="tier-players">
              {sortedPlayers.slice(0, 60).map((p, i) => renderPlayerRow(p, i + 1))}
            </ul>
          </section>
        )
      ) : !tiers.length ? (
        <p className="text-ink-medium p-6">{agent.emptyCopy}</p>
      ) : (
        <div className="tier-stack">
          {tiers.map((tier) => (
            <section key={tier.tier} className="tier-block chunky bg-bg-card p-4">
              <h3 className="tier-label" style={{ fontFamily: "var(--font-display)" }}>
                {tier.label}
              </h3>
              <ul className="tier-players">{tier.players.map((p) => renderPlayerRow(p))}</ul>
            </section>
          ))}
        </div>
      )}

      {topPlayer && (
        <footer className="mt-6 flex flex-wrap items-center gap-4 border-t border-ink pt-4">
          <Link
            href={
              toRoom({
                agentId: "octo",
                panelSlug: "rankings",
                question: formula
                  ? `${topPlayer.full_name} leads ${formula.name} (${topPlayer.formula_score?.toFixed(1) ?? "?"}) but dynasty value is ${topPlayer.dynasty_value?.toFixed(1) ?? "?"} — tier mismatch or buy window?`
                  : `Where does ${topPlayer.full_name} rank in dynasty value vs ${topPlayer.position} peers?`,
              }) as Route
            }
            className="text-sm text-orange underline"
          >
            Ask Octo about {topPlayer.full_name} →
          </Link>
          <LabOgExportLink
            slug="rankings"
            downloadName="razzle-dynasty-rankings.png"
            position={position || undefined}
            snapshotRows={ogSnapshotRows}
          />
        </footer>
      )}
    </div>
  );
}
