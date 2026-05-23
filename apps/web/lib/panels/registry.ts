// Razzle V2 panel registry.
//
// One entry per Lab panel. The /lab/[panel] route looks the slug up here
// and renders the registered React component. Adding a new panel is now
// a one-file change (add registry entry + module) instead of: add panel
// HTML, add panel CSS, add panel JS, register in lab.js, register in
// sidebar, write a standalone /panel.html wrapper.
//
// The first 10 panels listed in docs/DECISIONS.md ship in V2 launch.
// The rest are scaffolded as "coming-soon" entries the router falls back
// to so the sidebar is complete on day one.

import type { ComponentType } from "react";

export type PanelTier = "free" | "pro" | "elite";
export type PanelStatus = "live" | "coming-soon";

export interface PanelDef {
  slug: string;
  title: string;
  blurb: string;
  tier: PanelTier;
  status: PanelStatus;
  category: "screener" | "dynasty" | "analytics" | "matchup" | "bureau";
  // Lazy-imported render component for live panels.
  load?: () => Promise<{ default: ComponentType<{ panel: PanelDef }> }>;
}

export const PANELS: PanelDef[] = [
  // --- Live in V2 launch (first 10 per DECISIONS.md) ---
  {
    slug: "screener",
    title: "The Screener",
    blurb: "100+ stat columns, custom formulas, the table that started it all.",
    tier: "free",
    status: "live",
    category: "screener",
    load: () => import("./modules/screener-panel"),
  },
  {
    slug: "dynasty-rankings",
    title: "Dynasty Rankings",
    blurb: "Razzle-weighted dynasty values across all positions.",
    tier: "free",
    status: "live",
    category: "dynasty",
    load: () => import("./modules/dynasty-rankings"),
  },
  {
    slug: "trade-values",
    title: "Trade Value Chart",
    blurb: "Live trade values with age curves baked in.",
    tier: "free",
    status: "live",
    category: "dynasty",
    load: () => import("./modules/trade-values"),
  },
  {
    slug: "weekly-heatmap",
    title: "Weekly Heatmap",
    blurb: "Every player, every week, color-coded by performance.",
    tier: "pro",
    status: "live",
    category: "analytics",
    load: () => import("./modules/weekly-heatmap"),
  },
  {
    slug: "stat-leaders",
    title: "Stat Leaders",
    blurb: "Top performers, any stat, any season.",
    tier: "free",
    status: "live",
    category: "analytics",
    load: () => import("./modules/stat-leaders"),
  },
  {
    slug: "breakouts",
    title: "Breakout Candidates",
    blurb: "Usage spikes, opportunity changes, target trends.",
    tier: "pro",
    status: "live",
    category: "analytics",
    load: () => import("./modules/breakouts"),
  },
  {
    slug: "matchups",
    title: "Matchup Heatmap",
    blurb: "Position-vs-defense, league-wide, every week.",
    tier: "pro",
    status: "live",
    category: "matchup",
    load: () => import("./modules/matchups"),
  },
  {
    slug: "consistency",
    title: "Consistency Rankings",
    blurb: "Floor + ceiling, week-over-week stability.",
    tier: "pro",
    status: "live",
    category: "analytics",
    load: () => import("./modules/consistency"),
  },
  {
    slug: "efficiency",
    title: "Efficiency Rankings",
    blurb: "Yards per opportunity, TDs per RZ touch, the real value.",
    tier: "pro",
    status: "live",
    category: "analytics",
    load: () => import("./modules/efficiency"),
  },
  {
    slug: "aging-curves",
    title: "Aging Curves",
    blurb: "Position aging patterns from 10 years of nflverse data.",
    tier: "pro",
    status: "live",
    category: "dynasty",
    load: () => import("./modules/aging-curves"),
  },
  {
    slug: "vorp",
    title: "VORP",
    blurb: "Value over replacement player for your league settings.",
    tier: "pro",
    status: "live",
    category: "analytics",
    load: () => import("./modules/vorp"),
  },

  // --- Scaffolded for parity, ported on demand (Phase 4+ continues) ---
  { slug: "redzone", title: "Red Zone Usage", blurb: "RZ touches, targets, conversion rate.", tier: "pro", status: "coming-soon", category: "analytics" },
  { slug: "td-regression", title: "TD Regression", blurb: "Who's overperforming and headed for negative regression.", tier: "pro", status: "coming-soon", category: "analytics" },
  { slug: "workload", title: "Workload Trends", blurb: "Snaps, routes, touches over time.", tier: "pro", status: "coming-soon", category: "analytics" },
  { slug: "snap-trends", title: "Snap Count Trends", blurb: "Snap share leaders and risers.", tier: "pro", status: "coming-soon", category: "analytics" },
  { slug: "target-share", title: "Target Share", blurb: "Team-relative target share by player and week.", tier: "pro", status: "coming-soon", category: "analytics" },
  { slug: "air-yards", title: "Air Yards & aDOT", blurb: "Downfield usage, target depth.", tier: "pro", status: "coming-soon", category: "analytics" },
  { slug: "rookie-class", title: "Rookie Class", blurb: "Current-year rookies, college production + landing spots.", tier: "free", status: "coming-soon", category: "dynasty" },
  { slug: "prospects", title: "Prospect Database", blurb: "College and incoming-class scouting data.", tier: "pro", status: "coming-soon", category: "dynasty" },
  { slug: "playoff-odds", title: "Playoff Odds (Monte Carlo)", blurb: "10k simulations, your league.", tier: "pro", status: "coming-soon", category: "bureau" },
  { slug: "championship-odds", title: "Championship Odds", blurb: "Win-now vs rebuild positioning.", tier: "pro", status: "coming-soon", category: "bureau" },
];

export function getPanel(slug: string): PanelDef | undefined {
  return PANELS.find((p) => p.slug === slug);
}

export function panelsByCategory() {
  const groups = new Map<PanelDef["category"], PanelDef[]>();
  for (const p of PANELS) {
    const arr = groups.get(p.category) ?? [];
    arr.push(p);
    groups.set(p.category, arr);
  }
  return groups;
}
