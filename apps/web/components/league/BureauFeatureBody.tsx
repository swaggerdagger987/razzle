"use client";

import type { BureauFeatureSlug } from "@/lib/bureau-features";
import { BureauRowsTable } from "./BureauRowsTable";
import { BureauSelfScout } from "./BureauSelfScout";
import { BureauMonteCarlo } from "./BureauMonteCarlo";

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
  if (feature === "monte-carlo") return <BureauMonteCarlo data={data} />;

  const title = TITLES[feature];

  if (Array.isArray(data.rows)) {
    return <BureauRowsTable rows={data.rows as Array<Record<string, unknown>>} title={title} />;
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
