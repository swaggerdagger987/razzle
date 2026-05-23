"use client";

import { AGENT_BY_ID } from "@razzle/agents";
import type { PanelDefinition } from "@razzle/panels";
import { PositionPill } from "@razzle/ui";
import { toRoom } from "@razzle/hallway";
import Link from "next/link";
import type { Route } from "next";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { isUpgradeRequiredError } from "@/lib/panel-api";
import { usePlayerSheet } from "@/lib/player-sheet-context";
import { ProUpgradeGate } from "../ProUpgradeGate";

const POSITIONS = ["", "QB", "RB", "WR", "TE"] as const;

const POS_COLORS: Record<string, string> = {
  QB: "#5b7fff",
  RB: "#2ec4b6",
  WR: "#d97757",
  TE: "#8b5cf6",
};

interface PlayerRow {
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
  const bones = AGENT_BY_ID.bones;

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

  const players = q.data?.players ?? [];
  const maxVal = useMemo(
    () => Math.max(...players.map((p) => p.trade_value ?? 0), 1),
    [players],
  );
  const topPlayer = players[0] ?? null;

  if (q.isPending) {
    return (
      <p className="text-ink-medium p-6" style={{ fontFamily: "var(--font-hand)" }}>
        {bones.loadingCopy}
      </p>
    );
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

  return (
    <div className="trade-values">
      <header className="panel-agent-header mb-4 flex items-start gap-3">
        <img src={`/agents/${bones.avatar}.svg`} alt="" width={40} height={40} className="rounded-full" />
        <div>
          <p className="text-sm font-bold">{bones.name}</p>
          <p className="text-ink-medium text-xs">{bones.role} · trade value chart</p>
        </div>
      </header>

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
          {q.data.total ?? 0} players · {q.data.season} · production + age + scarcity
        </p>
      )}

      {!players.length ? (
        <p className="text-ink-medium p-6">{bones.emptyCopy}</p>
      ) : (
        <div className="chart-panel chunky bg-bg-card p-4">
          {players.slice(0, 40).map((p) => {
            const val = p.trade_value ?? 0;
            const pct = (val / maxVal) * 100;
            const color = POS_COLORS[p.position] ?? "#d97757";
            return (
              <div key={p.player_id} className="chart-bar-row mb-2 flex items-center gap-2">
                <span className="chart-bar-label w-6 text-xs text-ink-medium" style={{ fontFamily: "var(--font-mono)" }}>
                  {p.rank ?? "—"}
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
                {p.tier_label && (
                  <span className="hidden text-xs text-ink-medium sm:inline">{p.tier_label}</span>
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
                question: `Would you trade ${topPlayer.full_name} in dynasty? What's fair value?`,
              }) as Route
            }
            className="text-sm text-orange underline"
          >
            Ask Bones about {topPlayer.full_name} →
          </Link>
          <a href="/og/tradevalues?download=1" className="text-sm text-ink-medium underline" download="razzle-trade-values.png">
            export card
          </a>
        </footer>
      )}
    </div>
  );
}
