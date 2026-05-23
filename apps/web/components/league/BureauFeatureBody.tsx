"use client";

import type { BureauFeatureSlug } from "@/lib/bureau-features";
import { BureauRowsTable } from "./BureauRowsTable";
import { BureauSelfScout } from "./BureauSelfScout";

const TITLES: Partial<Record<BureauFeatureSlug, string>> = {
  "roster-depth": "Roster Depth",
  "build-profiles": "Build Profiles",
  "power-rankings": "Power Rankings",
  "trade-network": "Trade Network",
  "waiver-tendencies": "Waiver Tendencies",
  "strength-of-schedule": "Strength of Schedule",
  "monte-carlo": "Monte Carlo",
};

interface Props {
  feature: BureauFeatureSlug;
  data: Record<string, unknown>;
}

export function BureauFeatureBody({ feature, data }: Props) {
  if (feature === "self-scout") return <BureauSelfScout data={data} />;

  const title = TITLES[feature];

  if (Array.isArray(data.rows)) {
    return <BureauRowsTable rows={data.rows as Array<Record<string, unknown>>} title={title} />;
  }

  if (feature === "monte-carlo" && Array.isArray(data.projections)) {
    const rows = (data.projections as Array<Record<string, unknown>>)
      .filter((p) => Number(p.mean) > 0)
      .sort((a, b) => Number(b.mean) - Number(a.mean))
      .slice(0, 50)
      .map((p) => ({
        player: p.name ?? p.player_id,
        pos: p.position ?? "—",
        mean: p.mean,
        floor: p.floor,
        ceiling: p.ceiling,
        stddev: p.stddev,
        manager: p.manager,
      }));
    const withStats = Number(data.players_with_stats ?? 0);
    return (
      <div className="flex flex-col gap-4">
        <header>
          <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
            Monte Carlo
          </h1>
          <p className="text-ink-medium mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
            {String(data.season ?? "")} season · {withStats} players with weekly tape
          </p>
          <p className="text-ink-light mt-1 text-xs" style={{ fontFamily: "var(--font-hand)" }}>
            mean / floor / ceiling from game logs — championship sims next layer
          </p>
        </header>
        <BureauRowsTable rows={rows} emptyMessage="no weekly stats yet — sync terminal.db" />
      </div>
    );
  }

  if (feature === "roster-depth" && data.depth) {
    const depth = data.depth as Record<string, { count?: number; depth?: Array<Record<string, unknown>> }>;
    const rows = Object.entries(depth).flatMap(([pos, block]) =>
      (block.depth ?? []).map((p) => ({ position: pos, ...p })),
    );
    return <BureauRowsTable rows={rows} title="Roster Depth" />;
  }

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          {title ?? feature}
        </h1>
      </header>
      <p className="text-ink-medium text-sm">pulling film — data shape coming soon.</p>
    </div>
  );
}
