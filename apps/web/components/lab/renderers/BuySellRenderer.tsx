"use client";

import { AGENT_BY_ID } from "@razzle/agents";
import type { PanelDefinition } from "@razzle/panels";
import { PositionPill } from "@razzle/ui";
import { toRoom } from "@razzle/hallway";
import Link from "next/link";
import type { Route } from "next";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { isUpgradeRequiredError } from "@/lib/panel-api";
import { usePlayerSheet } from "@/lib/player-sheet-context";
import { ProUpgradeGate } from "../ProUpgradeGate";

const POSITIONS = ["", "QB", "RB", "WR", "TE"] as const;

interface Candidate {
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
  onOpen,
}: {
  player: Candidate;
  side: "buy" | "sell";
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
            #{player.rank} {player.name}
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
  const bones = AGENT_BY_ID.bones;

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

  const buyLow = q.data?.buy_low ?? [];
  const sellHigh = q.data?.sell_high ?? [];
  const topBuy = buyLow[0] ?? null;
  const topSell = sellHigh[0] ?? null;

  const open = (p: Candidate) =>
    openPlayer({
      playerId: p.player_id,
      slug: slugify(p.name),
      name: p.name,
      position: p.position,
      team: p.team,
    });

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
        <ProUpgradeGate panelTitle={panel.title} required={err.required} current={err.current} message={err.message} />
      );
    }
    return <p className="p-6 text-red">something fumbled: {err.message}</p>;
  }

  return (
    <div className="buy-sell-panel">
      <header className="panel-agent-header mb-4 flex items-start gap-3">
        <img src={`/agents/${bones.avatar}.svg`} alt="" width={40} height={40} className="rounded-full" />
        <div>
          <p className="text-sm font-bold">{bones.name}</p>
          <p className="text-ink-medium text-xs">{bones.role} · efficiency vs dynasty rank mismatch</p>
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
          {q.data.season} season · buy when efficiency beats rank · sell when rank beats tape
        </p>
      )}

      {!buyLow.length && !sellHigh.length ? (
        <p className="text-ink-medium p-6">{bones.emptyCopy}</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <section>
            <h3 className="mb-3 text-lg font-bold text-teal" style={{ fontFamily: "var(--font-display)" }}>
              Buy low
            </h3>
            <div className="flex flex-col gap-3">
              {buyLow.map((p) => (
                <CandidateCard key={p.player_id} player={p} side="buy" onOpen={open} />
              ))}
            </div>
          </section>
          <section>
            <h3 className="mb-3 text-lg font-bold text-orange" style={{ fontFamily: "var(--font-display)" }}>
              Sell high
            </h3>
            <div className="flex flex-col gap-3">
              {sellHigh.map((p) => (
                <CandidateCard key={p.player_id} player={p} side="sell" onOpen={open} />
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
                  question: `${topBuy.name} grades ${topBuy.efficiency_grade} on efficiency but ranks ${topBuy.dynasty_rank_pct}th percentile — buy low before the market catches up?`,
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
                  question: `${topSell.name} ranks ${topSell.dynasty_rank_pct}th percentile but efficiency is ${topSell.efficiency_grade} — sell high window?`,
                }) as Route
              }
              className="text-sm text-orange underline"
            >
              Ask Bones about {topSell.name} (sell) →
            </Link>
          )}
        </footer>
      )}
    </div>
  );
}
