/** Static blur-preview rows + staff voice for Pro upgrade gates (Lab L4). */

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
  "dynasty-comps": [
    { name: "Ja'Marr Chase", position: "WR", detail: "Comp tier · 98% match" },
    { name: "Marvin Harrison Jr.", position: "WR", detail: "Comp tier · 91% match" },
    { name: "Brian Thomas Jr.", position: "WR", detail: "Comp tier · 87% match" },
  ],
};

const PITCH_BY_SLUG: Record<string, string> = {
  rankings: "full dynasty tiers and trade-value curves — not just the free screener",
  tradevalues: "value curves and market inefficiencies your league mates can't see",
  breakouts: "next-wave producers before the waiver wire notices",
  efficiency: "points-per-opportunity ranks that separate luck from role",
  aging: "peak-age curves so you sell before the cliff, not after",
  buysell: "buy-low and sell-high mismatches ranked by market lag",
  gamelog: "week-by-week game logs with peak-week context for trades",
  "dynasty-comps": "player comp tiers and similarity scores for trade framing",
};

export function teaserRowsForPanel(slug: string): TeaserRow[] {
  return ROWS_BY_SLUG[slug] ?? DEFAULT_ROWS;
}

export function upgradePitchForPanel(slug: string, agentName: string): string {
  const pitch = PITCH_BY_SLUG[slug];
  if (pitch) return `${agentName}: unlock ${pitch}.`;
  return `${agentName}: this panel is Pro — the screener stays free, the intel doesn't.`;
}
