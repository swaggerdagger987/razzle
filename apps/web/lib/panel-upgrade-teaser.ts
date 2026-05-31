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
    { name: "Jayden Higgins", position: "WR", detail: "Wk 14 · 28.4 pts · spike week" },
    { name: "Cam Skattebo", position: "RB", detail: "Wk 13 · 24.1 pts · role climb" },
    { name: "Brock Bowers", position: "TE", detail: "Wk 12 · 19.8 pts · target share ↑" },
  ],
  prospects: [
    { name: "Travis Hunter", position: "WR", detail: "RPS 94 · draft stock climbing" },
    { name: "Cam Ward", position: "QB", detail: "RPS 91 · rushing upside" },
    { name: "Ashton Jeanty", position: "RB", detail: "RPS 89 · workload profile" },
  ],
  dashboard: [
    { name: "Ladd McConkey", position: "WR", detail: "Rank chg +12 · buy window" },
    { name: "Malik Nabers", position: "WR", detail: "Rank chg +9 · rising asset" },
    { name: "Davante Adams", position: "WR", detail: "Rank chg -8 · sell signal" },
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
  tiers: "S/A/B/C tiers so trades stop feeling random",
  vorp: "value-over-replacement ranks that show who actually moves the needle",
  stocks: "rising and falling dynasty assets before your league reacts",
  waivers: "waiver-wire risers ranked by recent production and role",
  "dynasty-comps": "statistical comps for any dynasty asset you're pricing",
  weekly: "weekly heatmap spikes — who actually popped, not season-long noise",
  prospects: "college prospect big board with RPS scores before your league drafts",
  dashboard: "dynasty dashboard movers — risers, fallers, and rank deltas in one view",
};

export function teaserRowsForPanel(slug: string): TeaserRow[] {
  return ROWS_BY_SLUG[slug] ?? DEFAULT_ROWS;
}

export function upgradePitchForPanel(slug: string, agentName: string): string {
  const pitch = PITCH_BY_SLUG[slug];
  if (pitch) return `${agentName}: unlock ${pitch}.`;
  return `${agentName}: this panel is Pro — the screener stays free, the intel doesn't.`;
}
