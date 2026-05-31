import { PANELS } from "@razzle/panels";

/** Static blur-preview rows + staff voice for Pro upgrade gates (Lab L4). */

import { getPanel } from "@razzle/panels";
import { BUREAU_ENDPOINTS } from "./bureau-features";

/** Launch-10 Staff Picks — mirrors `LabSidebar` STAFF_PICKS + PARITY Launch 10 table. */
export const LAUNCH_10_STAFF_PICK_SLUGS = [
  "weekly",
  "prospects",
  "rankings",
  "tradevalues",
  "breakouts",
  "gamelog",
  "efficiency",
  "aging",
  "buysell",
  "dashboard",
] as const;

/** Pro-tier launch panels (generic `ProUpgradeGate` + dedicated renderers). */
export const LAUNCH_10_PRO_GATE_SLUGS = [
  "rankings",
  "tradevalues",
  "breakouts",
  "gamelog",
  "efficiency",
  "aging",
  "buysell",
] as const;

/** Bureau-7 behavioral moat tabs — mirrors COUNCIL + `LeagueDashboard` screenshot set. */
export const BUREAU_7_FEATURE_SLUGS = [
  "self-scout",
  "head-to-head",
  "pressure-map",
  "trade-network",
  "trade-finder",
  "manager-profiles",
  "monte-carlo",
] as const;

function launch10PerkTitles(): string[] {
  return LAUNCH_10_STAFF_PICK_SLUGS.map((slug) => getPanel(slug)?.title ?? slug);
}

function bureau7PerkLabels(): string[] {
  return BUREAU_7_FEATURE_SLUGS.map((slug) => BUREAU_ENDPOINTS[slug]?.title ?? slug);
}

/** Three conversion bullets — catalog + Bureau labels, not marketing placeholders. */
export function proUpgradePerkLines(): [string, string, string] {
  return [
    `10 launch Lab panels — ${launch10PerkTitles().join(", ")}`,
    `7 Bureau behavioral tabs — ${bureau7PerkLabels().join(", ")}`,
    "Situation Room — six pixel staff, your league in context",
  ];
}

export type TeaserPosition = "QB" | "RB" | "WR" | "TE";

export interface TeaserRow {
  name: string;
  position: TeaserPosition;
  detail: string;
}

const DEFAULT_ROWS: TeaserRow[] = [
  { name: "Ja'Marr Chase", position: "WR", detail: "Tier 1 · 98.2 value" },
  { name: "Bijan Robinson", position: "RB", detail: "Tier 1 · 96.4 value" },
  { name: "Brock Bowers", position: "TE", detail: "Tier 2 · 88.1 value" },
];

const ROWS_BY_SLUG: Record<string, TeaserRow[]> = {
  rankings: DEFAULT_ROWS,
  tradevalues: [
    { name: "CeeDee Lamb", position: "WR", detail: "Value curve peak · 94" },
    { name: "Jonathan Taylor", position: "RB", detail: "Buy window · 78" },
    { name: "Marvin Harrison Jr.", position: "WR", detail: "Sell high · 91" },
  ],
  breakouts: [
    { name: "Jayden Higgins", position: "WR", detail: "RBS 82 · opp gap +18" },
    { name: "Cam Skattebo", position: "RB", detail: "RBS 79 · snap climb" },
    { name: "Elic Ayomanor", position: "WR", detail: "RBS 76 · target share ↑" },
  ],
  efficiency: [
    { name: "Saquon Barkley", position: "RB", detail: "0.82 PPO · volume king" },
    { name: "Amon-Ra St. Brown", position: "WR", detail: "0.71 PPO · most efficient" },
    { name: "George Kittle", position: "TE", detail: "0.68 PPO · red zone equity" },
  ],
  aging: [
    { name: "Davante Adams", position: "WR", detail: "Past peak · sell window" },
    { name: "Christian McCaffrey", position: "RB", detail: "Peak age · 29" },
    { name: "Travis Kelce", position: "TE", detail: "Decline curve · 35" },
  ],
  buysell: [
    { name: "Garrett Wilson", position: "WR", detail: "Buy low · rank mismatch" },
    { name: "Deebo Samuel", position: "WR", detail: "Sell high · efficiency A" },
    { name: "James Cook", position: "RB", detail: "Buy low · market lag" },
  ],
  gamelog: [
    { name: "Josh Allen", position: "QB", detail: "Wk 12 · 32.4 pts" },
    { name: "Josh Allen", position: "QB", detail: "Wk 11 · 28.1 pts" },
    { name: "Josh Allen", position: "QB", detail: "Wk 10 · 41.2 pts" },
  ],
  tiers: [
    { name: "CeeDee Lamb", position: "WR", detail: "Tier S · win-now anchor" },
    { name: "Bijan Robinson", position: "RB", detail: "Tier S · youth + volume" },
    { name: "Brock Bowers", position: "TE", detail: "Tier A · positional scarcity" },
  ],
  vorp: [
    { name: "Christian McCaffrey", position: "RB", detail: "VORP +4.2 · RB1 gap" },
    { name: "Tyreek Hill", position: "WR", detail: "VORP +3.1 · spike weeks" },
    { name: "Travis Kelce", position: "TE", detail: "VORP +2.8 · TE cliff" },
  ],
  stocks: [
    { name: "Garrett Wilson", position: "WR", detail: "Rising · +12 rank wk" },
    { name: "Deebo Samuel", position: "WR", detail: "Falling · sell window" },
    { name: "James Cook", position: "RB", detail: "Rising · market lag" },
  ],
  waivers: [
    { name: "Jayden Higgins", position: "WR", detail: "FAAB 18% · snap climb" },
    { name: "Cam Skattebo", position: "RB", detail: "FAAB 12% · role emerging" },
    { name: "Elic Ayomanor", position: "WR", detail: "FAAB 9% · targets ↑" },
  ],
  "dynasty-comps": [
    { name: "Ja'Marr Chase", position: "WR", detail: "Comp: CeeDee Lamb · 94% match" },
    { name: "Bijan Robinson", position: "RB", detail: "Comp: Jonathan Taylor · 91%" },
    { name: "Marvin Harrison Jr.", position: "WR", detail: "Comp: Mike Evans · 88%" },
  ],
  weekly: [
    { name: "Tyreek Hill", position: "WR", detail: "Wk 12 · 31.4 pts · hot cell" },
    { name: "Amon-Ra St. Brown", position: "WR", detail: "Wk 11 · 28.2 pts" },
    { name: "Garrett Wilson", position: "WR", detail: "Wk 10 · 9.1 pts · cold streak" },
  ],
  prospects: [
    { name: "Travis Hunter", position: "WR", detail: "RPS 94 · combine 4.4" },
    { name: "Cam Ward", position: "QB", detail: "RPS 91 · draft capital 1.01" },
    { name: "Omarion Hampton", position: "RB", detail: "RPS 88 · workload path" },
  ],
  dashboard: [
    { name: "Bijan Robinson", position: "RB", detail: "Riser · +8 rank · 24.1 PPG" },
    { name: "Davante Adams", position: "WR", detail: "Faller · sell window" },
    { name: "Garrett Wilson", position: "WR", detail: "Value pick · market lag" },
  ],
};

const PITCH_BY_SLUG: Record<string, string> = {
  rankings: "full dynasty tiers, trade-value curves, and rank movers — the screener stays free, the board does not",
  tradevalues: "value curves with buy/sell windows — spot who your league is sleeping on before the trade deadline",
  breakouts: "RBS breakout scores and snap climbs — flag next-wave producers before the waiver wire blows up",
  efficiency: "points-per-opportunity ranks that separate luck from role",
  aging: "peak-age curves so you sell before the cliff, not after",
  buysell: "buy-low and sell-high mismatches ranked by market lag",
  gamelog: "week-by-week game logs with peak-week context for trades",
  tiers: "S/A/B/C tiers so trades stop feeling random",
  vorp: "value-over-replacement ranks that show who actually moves the needle",
  stocks: "rising and falling dynasty assets before your league reacts",
  waivers: "waiver-wire risers ranked by recent production and role",
  "dynasty-comps": "statistical comp cards with match % — price any dynasty asset like a desk",
  weekly: "weekly heatmap streaks before your league mates spot the run",
  prospects: "rookie big board with combine and college context",
  dashboard: "dynasty pulse — risers, fallers, and value picks in one view",
};

export function hasCustomTeaser(slug: string): boolean {
  return slug in ROWS_BY_SLUG && slug in PITCH_BY_SLUG;
}

export function teaserRowsForPanel(slug: string): TeaserRow[] {
  return ROWS_BY_SLUG[slug] ?? DEFAULT_ROWS;
}

export function upgradePitchForPanel(slug: string, agentName: string): string {
  const pitch = PITCH_BY_SLUG[slug];
  if (pitch) return `${agentName}: unlock ${pitch}.`;
  return `${agentName}: this panel is Pro — the screener stays free, the intel doesn't.`;
}

/** Launch-10 panel titles in PARITY table order — for Pro gate perks copy. */
export function launch10PerkLabels(): string[] {
  const bySlug = Object.fromEntries(PANELS.map((p) => [p.slug, p.title]));
  return LAUNCH_10_STAFF_PICK_SLUGS.map((slug) => bySlug[slug] ?? slug);
}

export function formatPerkNameList(labels: readonly string[]): string {
  return labels.join(", ");
}
