"use client";

import type { PanelDefinition } from "@razzle/panels";
import { PositionPill } from "@razzle/ui";
import { toRoom } from "@razzle/hallway";
import Link from "next/link";
import type { Route } from "next";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { isUpgradeRequiredError } from "@/lib/panel-api";
import { usePlayerSheet } from "@/lib/player-sheet-context";
import { PanelAgentHeader, PanelAgentLoading, panelAgent } from "../PanelAgentHeader";
import { ProUpgradeGate } from "../ProUpgradeGate";

const POSITIONS = ["", "QB", "RB", "WR", "TE"] as const;

interface EfficiencyPlayer {
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
}: {
  title: string;
  players: EfficiencyPlayer[];
  onOpen: (p: EfficiencyPlayer) => void;
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

  const top = q.data?.most_efficient?.[0] ?? q.data?.volume_kings?.[0] ?? null;

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
    const err = q.error as Error & { upgrade?: { required?: string; current?: string; message?: string } };
    if (err.upgrade) {
      return (
        <ProUpgradeGate
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
          panelTitle={panel.title}
          required={err.required}
          current={err.current}
          message={err.message}
        />
      );
    }
    return <p className="p-6 text-red">something fumbled: {err.message}</p>;
  }

  const efficient = q.data?.most_efficient ?? [];
  const volume = q.data?.volume_kings ?? [];

  return (
    <div className="efficiency-panel">
      <PanelAgentHeader agent={agent} subtitle="points per opportunity" />

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
        <p className="text-ink-medium p-6">{agent.emptyCopy}</p>
      ) : (
        <>
          <PlayerTable title="Most efficient" players={efficient} onOpen={open} />
          <PlayerTable title="Volume kings" players={volume} onOpen={open} />
        </>
      )}

      {top && (
        <footer className="mt-6 flex flex-wrap items-center gap-4 border-t border-ink pt-4">
          <Link
            href={
              toRoom({
                agentId: "octo",
                panelSlug: "efficiency",
                question: `${top.name} grades ${top.grade ?? "?"} on efficiency — ${top.ppo?.toFixed(2) ?? "?"} PPO. Worth rostering for efficiency or just volume?`,
              }) as Route
            }
            className="text-sm text-orange underline"
          >
            Ask Octo about {top.name} →
          </Link>
        </footer>
      )}
    </div>
  );
}
