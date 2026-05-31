import { ImageResponse } from "next/og";
import { getPanel } from "@razzle/panels";
import { agentForPanel } from "@razzle/agents";
import { teaserRowsForPanel } from "@/lib/panel-upgrade-teaser";

export const runtime = "edge";

const POS_COLOR: Record<string, string> = {
  QB: "#5b7fff",
  RB: "#2ec4b6",
  WR: "#d97757",
  TE: "#8b5cf6",
};

interface OgRow {
  name: string;
  position: string;
  team: string;
  stat: number;
  statLabel: string;
}

const STAT_CANDIDATE_KEYS = [
  "fantasy_points_ppr",
  "dynasty_value",
  "formula_score",
  "trade_value",
  "value",
  "ppg",
  "fpts",
  "score",
  "rbs_score",
  "breakout_score",
  "similarity",
  "mismatch_score",
  "rank_diff",
  "composite_score",
  "efficiency_score",
  "ppo",
  "rps",
  "total_yards",
  "pts",
  "rank",
] as const;

const OG_PRO_PREVIEW_HEADER = "X-Razzle-Plan";

/** Ja'Marr Chase — nflverse gsis_id for OG previews when no player_id in URL. */
const DEFAULT_OG_PLAYER_ID = "00-0036900";

/** Lab panels that require player_id on the API (path or query). */
const PLAYER_SCOPED_SLUGS = new Set([
  "dynasty-comps",
  "gamelog",
  "percentiles",
  "career",
  "career-compare",
  "strengths",
  "breakdown",
  "fptsbreakdown",
  "archetypes",
]);

/** Launch-10 Lab panels — live OG cards use panel blurb only (no sample/live suffix). */
/** Panel-specific stat for OG ranking (matches in-product Lab renderers). */
const PANEL_OG_STAT_KEY: Record<string, string> = {
  weekly: "ppg",
  prospects: "rps",
  breakouts: "rbs_score",
  rankings: "dynasty_value",
  tradevalues: "trade_value",
  efficiency: "ppo",
  aging: "ppg",
  buysell: "mismatch_score",
  dashboard: "rank_diff",
};

const LAUNCH_10_OG_SLUGS = new Set([
  "weekly",
  "prospects",
  "dashboard",
  "rankings",
  "tradevalues",
  "breakouts",
  "gamelog",
  "efficiency",
  "aging",
  "buysell",
]);

/** Panel-specific LIVE copy when `/api/panels/{slug}` returns real rows (Launch-10). */
function launch10LiveBlurbSuffix(slug: string): string {
  if (slug === "prospects") return " · live RPS board";
  if (slug === "weekly") return " · live PPG heatmap";
  if (slug === "rankings") return " · live dynasty ranks";
  if (slug === "tradevalues") return " · live value curve";
  if (slug === "breakouts") return " · live RBS board";
  return " · live nflverse rows";
}

function launch10LiveStickerLabel(slug: string): string {
  if (slug === "prospects") return "LIVE · RPS board";
  if (slug === "weekly") return "LIVE · PPG heatmap";
  if (slug === "rankings") return "LIVE · dynasty ranks";
  if (slug === "tradevalues") return "LIVE · value curve";
  if (slug === "breakouts") return "LIVE · RBS board";
  return "LIVE · nflverse rows";
}

/** Panel-specific SAMPLE copy when demo rows render (teal LIVE sticker contrast). */
function launch10SampleStickerLabel(slug: string): string {
  if (slug === "prospects") return "SAMPLE · RPS board";
  if (slug === "weekly") return "SAMPLE · PPG heatmap";
  if (slug === "dynasty-comps") return "SAMPLE · comp preview";
  if (slug === "rankings") return "SAMPLE · dynasty ranks";
  if (slug === "tradevalues") return "SAMPLE · value curve";
  if (slug === "breakouts") return "SAMPLE · RBS board";
  return "SAMPLE · preview rows";
}

function panelBlurbSuffix(
  slug: string,
  positionFilter: string,
  isSnapshot: boolean,
  showingDemoRows: boolean,
  showingLiveData: boolean,
): string {
  const pos = positionFilter ? ` · ${positionFilter} only` : "";
  if (slug === "dynasty-comps" && showingDemoRows) {
    return `${pos} · Pro comp preview · sample`;
  }
  if (isSnapshot) {
    return `${pos} · from your panel`;
  }
  if (showingDemoRows) {
    if (LAUNCH_10_OG_SLUGS.has(slug)) {
      return `${pos} · SAMPLE rows — not live nflverse`;
    }
    return `${pos} · sample preview`;
  }
  if (showingLiveData && LAUNCH_10_OG_SLUGS.has(slug)) {
    return `${pos}${launch10LiveBlurbSuffix(slug)}`;
  }
  if (showingLiveData) {
    return `${pos} · live data`;
  }
  return pos;
}

function resolvePanelApiPath(path: string, playerId: string): string {
  return path.replace(/\{player_id\}/g, encodeURIComponent(playerId));
}

/** Sample rows for OG preview when API/terminal.db unavailable (FACTORY-DOD Gate C). */
const DEFAULT_DEMO_ROWS: OgRow[] = [
  { name: "Ja'Marr Chase", position: "WR", team: "CIN", stat: 312.4, statLabel: "Value" },
  { name: "Bijan Robinson", position: "RB", team: "ATL", stat: 298.1, statLabel: "Value" },
  { name: "Brock Bowers", position: "TE", team: "LV", stat: 241.6, statLabel: "Value" },
  { name: "Jayden Daniels", position: "QB", team: "WAS", stat: 228.9, statLabel: "Value" },
  { name: "Marvin Harrison Jr.", position: "WR", team: "ARI", stat: 215.2, statLabel: "Value" },
  { name: "Brian Thomas Jr.", position: "WR", team: "JAX", stat: 201.8, statLabel: "Value" },
];

const DEMO_ROWS_BY_SLUG: Record<string, OgRow[]> = {
  weekly: [
    { name: "Jayden Daniels", position: "QB", team: "WAS", stat: 26.8, statLabel: "PPG" },
    { name: "Ja'Marr Chase", position: "WR", team: "CIN", stat: 24.6, statLabel: "PPG" },
    { name: "Bijan Robinson", position: "RB", team: "ATL", stat: 22.1, statLabel: "PPG" },
    { name: "Brian Thomas Jr.", position: "WR", team: "JAX", stat: 19.7, statLabel: "PPG" },
    { name: "Brock Bowers", position: "TE", team: "LV", stat: 18.4, statLabel: "PPG" },
    { name: "Marvin Harrison Jr.", position: "WR", team: "ARI", stat: 14.2, statLabel: "PPG" },
  ],
  prospects: [
    { name: "Travis Hunter", position: "WR", team: "JAX", stat: 94, statLabel: "RPS" },
    { name: "Cam Ward", position: "QB", team: "TEN", stat: 91, statLabel: "RPS" },
    { name: "Ashton Jeanty", position: "RB", team: "LV", stat: 89, statLabel: "RPS" },
    { name: "Tyler Warren", position: "TE", team: "IND", stat: 86, statLabel: "RPS" },
    { name: "Tre Harris", position: "WR", team: "LAC", stat: 83, statLabel: "RPS" },
    { name: "Emeka Egbuka", position: "WR", team: "TB", stat: 80, statLabel: "RPS" },
  ],
  rankings: [
    { name: "Ja'Marr Chase", position: "WR", team: "CIN", stat: 1, statLabel: "Rank" },
    { name: "Bijan Robinson", position: "RB", team: "ATL", stat: 2, statLabel: "Rank" },
    { name: "Brock Bowers", position: "TE", team: "LV", stat: 3, statLabel: "Rank" },
    { name: "Jayden Daniels", position: "QB", team: "WAS", stat: 4, statLabel: "Rank" },
    { name: "Marvin Harrison Jr.", position: "WR", team: "ARI", stat: 5, statLabel: "Rank" },
    { name: "Brian Thomas Jr.", position: "WR", team: "JAX", stat: 6, statLabel: "Rank" },
  ],
  tradevalues: [
    { name: "Ja'Marr Chase", position: "WR", team: "CIN", stat: 10200, statLabel: "Value" },
    { name: "Bijan Robinson", position: "RB", team: "ATL", stat: 9800, statLabel: "Value" },
    { name: "Brock Bowers", position: "TE", team: "LV", stat: 7600, statLabel: "Value" },
    { name: "Jayden Daniels", position: "QB", team: "WAS", stat: 8900, statLabel: "Value" },
    { name: "Marvin Harrison Jr.", position: "WR", team: "ARI", stat: 6200, statLabel: "Value" },
    { name: "Brian Thomas Jr.", position: "WR", team: "JAX", stat: 5800, statLabel: "Value" },
  ],
  breakouts: [
    { name: "Rome Odunze", position: "WR", team: "CHI", stat: 92, statLabel: "RBS" },
    { name: "Ladd McConkey", position: "WR", team: "LAC", stat: 88, statLabel: "RBS" },
    { name: "Marvin Harrison Jr.", position: "WR", team: "ARI", stat: 85, statLabel: "RBS" },
    { name: "Malik Nabers", position: "WR", team: "NYG", stat: 81, statLabel: "RBS" },
    { name: "Brian Thomas Jr.", position: "WR", team: "JAX", stat: 78, statLabel: "RBS" },
    { name: "Xavier Worthy", position: "WR", team: "KC", stat: 74, statLabel: "RBS" },
  ],
  gamelog: [
    { name: "Wk 12", position: "WR", team: "CIN", stat: 31.4, statLabel: "PPR" },
    { name: "Wk 8", position: "WR", team: "CIN", stat: 28.4, statLabel: "PPR" },
    { name: "Wk 15", position: "WR", team: "CIN", stat: 26.2, statLabel: "PPR" },
    { name: "Wk 4", position: "WR", team: "CIN", stat: 24.1, statLabel: "PPR" },
    { name: "Wk 10", position: "WR", team: "CIN", stat: 22.5, statLabel: "PPR" },
    { name: "Wk 6", position: "WR", team: "CIN", stat: 19.8, statLabel: "PPR" },
  ],
  efficiency: [
    { name: "Christian McCaffrey", position: "RB", team: "SF", stat: 0.42, statLabel: "Efficiency" },
    { name: "Tyreek Hill", position: "WR", team: "MIA", stat: 0.39, statLabel: "Efficiency" },
    { name: "Amon-Ra St. Brown", position: "WR", team: "DET", stat: 0.37, statLabel: "Efficiency" },
    { name: "Travis Kelce", position: "TE", team: "KC", stat: 0.35, statLabel: "Efficiency" },
    { name: "Saquon Barkley", position: "RB", team: "PHI", stat: 0.34, statLabel: "Efficiency" },
    { name: "CeeDee Lamb", position: "WR", team: "DAL", stat: 0.33, statLabel: "Efficiency" },
  ],
  aging: [
    { name: "Christian McCaffrey", position: "RB", team: "SF", stat: 28, statLabel: "Peak Age" },
    { name: "Tyreek Hill", position: "WR", team: "MIA", stat: 30, statLabel: "Peak Age" },
    { name: "Travis Kelce", position: "TE", team: "KC", stat: 31, statLabel: "Peak Age" },
    { name: "Patrick Mahomes", position: "QB", team: "KC", stat: 32, statLabel: "Peak Age" },
    { name: "Saquon Barkley", position: "RB", team: "PHI", stat: 27, statLabel: "Peak Age" },
    { name: "CeeDee Lamb", position: "WR", team: "DAL", stat: 26, statLabel: "Peak Age" },
  ],
  buysell: [
    { name: "Davante Adams", position: "WR", team: "NYJ", stat: 184.2, statLabel: "Value" },
    { name: "Joe Mixon", position: "RB", team: "HOU", stat: 162.5, statLabel: "Value" },
    { name: "Mark Andrews", position: "TE", team: "BAL", stat: 148.1, statLabel: "Value" },
    { name: "Kirk Cousins", position: "QB", team: "ATL", stat: 121.4, statLabel: "Value" },
    { name: "Stefon Diggs", position: "WR", team: "HOU", stat: 118.9, statLabel: "Value" },
    { name: "Aaron Jones", position: "RB", team: "MIN", stat: 112.3, statLabel: "Value" },
  ],
  dashboard: [
    { name: "Ladd McConkey", position: "WR", team: "LAC", stat: 12.4, statLabel: "Chg" },
    { name: "Malik Nabers", position: "WR", team: "NYG", stat: 9.8, statLabel: "Chg" },
    { name: "Davante Adams", position: "WR", team: "NYJ", stat: -8.2, statLabel: "Chg" },
    { name: "Joe Mixon", position: "RB", team: "HOU", stat: -6.1, statLabel: "Chg" },
    { name: "Xavier Worthy", position: "WR", team: "KC", stat: 7.5, statLabel: "Chg" },
    { name: "Stefon Diggs", position: "WR", team: "HOU", stat: -5.4, statLabel: "Chg" },
  ],
  "dynasty-comps": [
    { name: "Amon-Ra St. Brown", position: "WR", team: "DET", stat: 96, statLabel: "Match %" },
    { name: "CeeDee Lamb", position: "WR", team: "DAL", stat: 94, statLabel: "Match %" },
    { name: "Tyreek Hill", position: "WR", team: "MIA", stat: 91, statLabel: "Match %" },
    { name: "Justin Jefferson", position: "WR", team: "MIN", stat: 89, statLabel: "Match %" },
    { name: "Garrett Wilson", position: "WR", team: "NYJ", stat: 87, statLabel: "Match %" },
    { name: "Nico Collins", position: "WR", team: "HOU", stat: 85, statLabel: "Match %" },
  ],
};

/** Pro-gate teaser rows for OG when live comps unavailable (matches ProUpgradeGate preview). */
function dynastyCompsTeaserOgRows(): OgRow[] {
  const stats = [94, 91, 88];
  const teams = ["CIN", "IND", "TB"];
  return teaserRowsForPanel("dynasty-comps").map((row, i) => ({
    name: row.name,
    position: row.position,
    team: teams[i] ?? "—",
    stat: stats[i] ?? 85,
    statLabel: "Match %",
  }));
}

function demoRowsForPanel(slug: string): OgRow[] {
  if (slug === "dynasty-comps") return dynastyCompsTeaserOgRows();
  return DEMO_ROWS_BY_SLUG[slug] ?? DEFAULT_DEMO_ROWS;
}

type CompactOgRow = { n: string; p: string; t: string; s: number; sl: string };

function decodeOgSnapshot(param: string): OgRow[] {
  try {
    const b64 = param.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(b64);
    const arr = JSON.parse(json) as CompactOgRow[];
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((r) => r?.n)
      .slice(0, 6)
      .map((r) => ({
        name: r.n,
        position: r.p ?? "",
        team: r.t ?? "",
        stat: Number(r.s ?? 0),
        statLabel: r.sl ?? "",
      }));
  } catch {
    return [];
  }
}

/** Edge OG must hit same-origin `/api/*` so Next rewrites reach FastAPI (dev/preview/CI). */
function resolveApiOrigin(req: Request): string {
  return new URL(req.url).origin;
}

/** Weekly heatmap OG — rank by hottest single week (matches WeeklyHeatmapRenderer). */
function extractWeeklyHeatmapRows(
  players: Record<string, unknown>[],
  positionFilter: string,
): OgRow[] {
  let rows = players
    .map((p) => {
      const weeks = p.weeks as Record<string, number | null> | undefined;
      let bestWeek = 0;
      let bestPts = 0;
      if (weeks && typeof weeks === "object") {
        for (const [wk, pts] of Object.entries(weeks)) {
          if (pts != null && pts > bestPts) {
            bestPts = pts;
            bestWeek = Number(wk);
          }
        }
      }
      const ppg = Number(p.ppg ?? 0);
      const stat = bestPts > 0 ? bestPts : ppg;
      const statLabel = bestPts > 0 ? `Wk ${bestWeek}` : "PPG";
      return {
        name: String(p.name ?? ""),
        position: String(p.position ?? ""),
        team: String(p.team ?? ""),
        stat,
        statLabel,
      };
    })
    .filter((r) => r.name.trim().length > 0 && r.stat > 0);
  if (positionFilter) {
    rows = rows.filter((r) => r.position === positionFilter);
  }
  return [...rows].sort((a, b) => b.stat - a.stat).slice(0, 6);
}

/** Prospects big board — RPS sort (matches ProspectsRenderer). */
function extractProspectsRows(
  prospects: Record<string, unknown>[],
  positionFilter: string,
): OgRow[] {
  let rows = prospects
    .map((p) => {
      const rank = p.rank != null ? Number(p.rank) : null;
      return {
        name: String(p.player_name ?? p.name ?? p.full_name ?? ""),
        position: String(p.position ?? p.pos ?? ""),
        team: String(p.school ?? p.team ?? p.team_abbr ?? ""),
        stat: Number(p.rps ?? 0),
        statLabel: rank != null && rank > 0 ? `#${rank}` : "RPS",
      };
    })
    .filter((r) => r.name.trim().length > 0 && r.stat > 0);
  if (positionFilter) {
    rows = rows.filter((r) => r.position === positionFilter);
  }
  return [...rows].sort((a, b) => b.stat - a.stat).slice(0, 6);
}

/** Gamelog OG — top weeks by FPTS (matches GamelogRenderer ogSnapshotRows). */
function extractGamelogWeekRows(data: Record<string, unknown>): OgRow[] {
  const weeks = data.weeks as Array<{ week?: number; fpts?: number }> | undefined;
  if (!Array.isArray(weeks) || weeks.length === 0) return [];

  const position = String(data.position ?? "");
  const team = String(data.team ?? "");

  return [...weeks]
    .filter((w) => w.fpts != null && Number(w.fpts) > 0)
    .sort((a, b) => Number(b.fpts ?? 0) - Number(a.fpts ?? 0))
    .slice(0, 6)
    .map((w) => ({
      name: `Wk ${w.week}`,
      position,
      team,
      stat: Number(w.fpts ?? 0),
      statLabel: "PPR",
    }));
}

function statLabelForKey(k: string): string {
  let statLabel = k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  if (k === "fantasy_points_ppr") statLabel = "FPTS";
  if (k === "ppg") statLabel = "PPG";
  if (k === "rps") statLabel = "RPS";
  if (k === "dynasty_value" || k === "trade_value" || k === "value") statLabel = "Value";
  if (k === "ppo" || k === "efficiency_score") statLabel = "Efficiency";
  if (k === "age" || k === "peak_age") statLabel = "Peak Age";
  if (k === "mismatch_score") statLabel = "Value";
  if (k === "formula_score") statLabel = "Score";
  if (k === "rbs_score" || k === "breakout_score") statLabel = "RBS";
  if (k === "similarity") statLabel = "Match %";
  if (k === "rank_diff") statLabel = "Chg";
  return statLabel;
}

function extractRows(data: unknown, slug?: string, positionFilter = ""): OgRow[] {
  if (!data || typeof data !== "object") return [];

  const obj = data as Record<string, unknown>;

  if (slug === "weekly" && Array.isArray(obj.players)) {
    const weeklyRows = extractWeeklyHeatmapRows(
      obj.players as Record<string, unknown>[],
      positionFilter,
    );
    if (weeklyRows.length > 0) return weeklyRows;
  }

  if (slug === "prospects" && Array.isArray(obj.prospects)) {
    const prospectRows = extractProspectsRows(
      obj.prospects as Record<string, unknown>[],
      positionFilter,
    );
    if (prospectRows.length > 0) return prospectRows;
  }

  if (slug === "gamelog" && Array.isArray(obj.weeks)) {
    const gamelogRows = extractGamelogWeekRows(obj);
    if (gamelogRows.length > 0) return gamelogRows;
  }

  let candidates: Record<string, unknown>[] = [];

  if (Array.isArray(obj.most_efficient)) {
    candidates = obj.most_efficient as Record<string, unknown>[];
  } else if (slug === "aging" && obj.positions && typeof obj.positions === "object") {
    const positions = obj.positions as Record<
      string,
      { players?: Record<string, unknown>[] }
    >;
    const pos =
      positionFilter && positions[positionFilter]
        ? positionFilter
        : Object.keys(positions)[0];
    if (pos && Array.isArray(positions[pos]?.players)) {
      candidates = positions[pos]!.players!;
    }
  } else if (obj.positions && typeof obj.positions === "object") {
    const positions = obj.positions as Record<string, { players?: Record<string, unknown>[] }>;
    const keys = positionFilter && positions[positionFilter] ? [positionFilter] : Object.keys(positions);
    for (const k of keys) {
      const block = positions[k];
      if (Array.isArray(block?.players)) {
        candidates.push(...(block.players as Record<string, unknown>[]));
      }
    }
  } else if (Array.isArray(obj.items)) {
    candidates = obj.items as Record<string, unknown>[];
  } else if (Array.isArray(obj.tiers)) {
    for (const tier of obj.tiers as Record<string, unknown>[]) {
      if (Array.isArray(tier.players)) {
        candidates.push(...(tier.players as Record<string, unknown>[]));
      }
    }
  } else if (Array.isArray(obj.players)) {
    candidates = obj.players as Record<string, unknown>[];
  } else if (Array.isArray(obj.candidates)) {
    candidates = obj.candidates as Record<string, unknown>[];
  } else if (Array.isArray(obj.buy_low) || Array.isArray(obj.sell_high)) {
    const buyLow = Array.isArray(obj.buy_low) ? (obj.buy_low as Record<string, unknown>[]) : [];
    const sellHigh = Array.isArray(obj.sell_high) ? (obj.sell_high as Record<string, unknown>[]) : [];
    candidates = [...buyLow, ...sellHigh];
  } else if (Array.isArray(obj.buy) || Array.isArray(obj.sell)) {
    const buy = Array.isArray(obj.buy) ? (obj.buy as Record<string, unknown>[]) : [];
    const sell = Array.isArray(obj.sell) ? (obj.sell as Record<string, unknown>[]) : [];
    candidates = [...buy, ...sell];
  } else if (Array.isArray(obj.data)) {
    candidates = obj.data as Record<string, unknown>[];
  } else if (Array.isArray(obj.rankings)) {
    candidates = obj.rankings as Record<string, unknown>[];
  } else if (Array.isArray(obj.comps)) {
    candidates = obj.comps as Record<string, unknown>[];
  } else if (Array.isArray(obj.top5) || Array.isArray(obj.risers) || Array.isArray(obj.fallers)) {
    const top5 = Array.isArray(obj.top5) ? (obj.top5 as Record<string, unknown>[]) : [];
    const risers = Array.isArray(obj.risers) ? (obj.risers as Record<string, unknown>[]) : [];
    const fallers = Array.isArray(obj.fallers) ? (obj.fallers as Record<string, unknown>[]) : [];
    const valuePicks = Array.isArray(obj.value_picks) ? (obj.value_picks as Record<string, unknown>[]) : [];
    candidates = [...top5, ...risers, ...fallers, ...valuePicks];
  } else if (Array.isArray(data)) {
    candidates = data as Record<string, unknown>[];
  }

  if (candidates.length === 0) return [];

  const preferredKey = slug ? PANEL_OG_STAT_KEY[slug] : undefined;
  const tradeValueStatKeys: string[] = [
    "formula_score",
    "trade_value",
    ...STAT_CANDIDATE_KEYS.filter((k) => k !== "formula_score" && k !== "trade_value"),
  ];
  const statKeys =
    slug === "tradevalues"
      ? tradeValueStatKeys
      : preferredKey
        ? [preferredKey, ...STAT_CANDIDATE_KEYS.filter((k) => k !== preferredKey)]
        : [...STAT_CANDIDATE_KEYS];

  let statKey = "";
  let statLabel = "";
  for (const k of statKeys) {
    if (candidates[0] && k in candidates[0] && candidates[0][k] != null) {
      statKey = k;
      statLabel = statLabelForKey(k);
      break;
    }
  }

  return candidates.map((row) => ({
    name: String(row.full_name ?? row.name ?? row.player_name ?? ""),
    position: String(row.position ?? row.pos ?? ""),
    team: String(row.team ?? row.team_abbr ?? ""),
    stat:
      statKey === "similarity"
        ? Number(row[statKey] ?? 0) * (Number(row[statKey] ?? 0) <= 1 ? 100 : 1)
        : statKey
          ? Number(row[statKey] ?? 0)
          : 0,
    statLabel,
  }));
}

/** Top-N leaders for OG share cards — mirrors Lab renderer sort + position tab. */
function rankOgRowsForPanel(slug: string, rows: OgRow[], positionFilter: string): OgRow[] {
  let out = rows.filter((r) => r.name.trim().length > 0);
  if (positionFilter) {
    out = out.filter((r) => r.position === positionFilter);
  }
  if (PANEL_OG_STAT_KEY[slug]) {
    out = [...out].sort((a, b) => b.stat - a.stat).slice(0, 6);
  }
  return out;
}

function siteOrigin(req: Request): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_ORIGIN;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL;
  if (vercel) return vercel.startsWith("http") ? vercel.replace(/\/$/, "") : `https://${vercel}`;
  return new URL(req.url).origin;
}

/** Same panels slug path Lab uses — pro preview header for OG share cards. */
async function fetchLiveOgRows(
  req: Request,
  slug: string,
  params?: Record<string, unknown>,
): Promise<OgRow[]> {
  const url = new URL(`/api/panels/${slug}`, siteOrigin(req));
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v != null) url.searchParams.set(k, String(v));
    }
  }
  url.searchParams.set("limit", "6");
  try {
    const res = await fetch(url.toString(), {
      headers: { [OG_PRO_PREVIEW_HEADER]: "pro" },
    });
    if (!res.ok) return [];
    const pos = params?.position != null ? String(params.position) : "";
    return extractRows(await res.json(), slug, pos);
  } catch {
    return [];
  }
}

async function fetchPanelData(
  req: Request,
  slug: string,
  apiPath: string,
  method: string,
  params?: Record<string, unknown>,
): Promise<OgRow[]> {
  const apiOrigin = resolveApiOrigin(req);

  try {
    let res: Response;
    if (method === "POST") {
      res = await fetch(`${apiOrigin}${apiPath}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 6, ...(params ?? {}) }),
      });
    } else {
      const url = new URL(`${apiOrigin}${apiPath}`);
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          if (v != null) url.searchParams.set(k, String(v));
        }
      }
      url.searchParams.set("limit", "6");
      res = await fetch(url.toString());
    }
    if (!res.ok) return [];
    const data = await res.json();
    const pos = params?.position != null ? String(params.position) : "";
    return extractRows(data, slug, pos);
  } catch {
    return [];
  }
}

function formatStat(n: number, label?: string): string {
  if (n === 0) return "—";
  if (label === "Match %") {
    const pct = n <= 1 ? n * 100 : n;
    return `${Math.round(pct)}%`;
  }
  if (Number.isInteger(n)) return n.toLocaleString();
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}`;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ panel: string }> },
) {
  const { panel: slug } = await params;
  const url = new URL(req.url);
  const isDownload = url.searchParams.get("download") === "1";
  const forceDemo = url.searchParams.get("force_demo") === "1";
  const query = url.searchParams.get("q") ?? "";
  const positionFilter = url.searchParams.get("position") ?? "";
  const snapshotParam = url.searchParams.get("snapshot") ?? "";
  const playerId =
    url.searchParams.get("player_id") ??
    url.searchParams.get("id") ??
    DEFAULT_OG_PLAYER_ID;

  const panel = getPanel(slug);
  if (!panel) {
    return new Response("panel not found", { status: 404 });
  }

  const agent = agentForPanel(slug);
  const agentEmoji = agent?.emoji ?? "🐯";
  const agentName = agent?.name ?? "Razzle";

  const rawPath = panel.api.path;
  const apiPath = rawPath.includes("{player_id}")
    ? resolvePanelApiPath(rawPath, playerId)
    : rawPath;
  const apiParams: Record<string, unknown> = {
    ...(panel.api.params as Record<string, unknown> | undefined),
  };
  if (PLAYER_SCOPED_SLUGS.has(slug)) {
    apiParams.player_id = playerId;
  }
  if (positionFilter) {
    apiParams.position = positionFilter;
  } else if (slug === "weekly" && apiParams.position == null) {
    // Match WeeklyHeatmapRenderer default so /api/panels/weekly returns live rows for OG.
    apiParams.position = "WR";
  }
  const snapshotRows = snapshotParam ? decodeOgSnapshot(snapshotParam) : [];
  const snapshotHasRows =
    snapshotRows.length > 0 && snapshotRows.some((r) => r.name);
  let liveRows: OgRow[] = [];
  if (apiPath && !snapshotHasRows && !forceDemo) {
    liveRows = await fetchLiveOgRows(req, slug, apiParams);
    if (liveRows.length === 0) {
      liveRows = await fetchPanelData(req, slug, apiPath, panel.api.method, apiParams);
    }
  }
  const namedLiveRows = liveRows.filter((r) => r.name.trim().length > 0);
  const liveHasRows = namedLiveRows.length > 0;
  const isSnapshot = snapshotHasRows;
  let rows = isSnapshot
    ? snapshotRows.slice(0, 6)
    : liveHasRows
      ? rankOgRowsForPanel(slug, namedLiveRows, positionFilter)
      : rankOgRowsForPanel(slug, demoRowsForPanel(slug), positionFilter);
  if (isSnapshot && positionFilter) {
    rows = rows.filter((r) => r.position === positionFilter);
  }

  const hasRows = rows.length > 0 && rows.some((r) => r.name);
  const showingLiveData = !isSnapshot && liveHasRows && hasRows;
  const showingDemoRows = !isSnapshot && !showingLiveData && hasRows;
  const colHeader = hasRows ? (rows[0]?.statLabel ?? "") : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#ede0cf",
          color: "#2d1f14",
          display: "flex",
          flexDirection: "column",
          padding: 48,
          fontFamily: "Space Mono",
          border: "10px solid #2d1f14",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
          <div style={{ fontSize: 48, display: "flex" }}>🐯</div>
          <div style={{ display: "flex", fontSize: 36, fontWeight: 700 }}>
            Razzle<span style={{ color: "#d97757" }}>.lol</span>
          </div>
          <div style={{ flex: 1, display: "flex" }} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 20,
              color: "#5c4a3d",
              background: "#f7efe5",
              padding: "4px 14px",
              border: "2px solid #2d1f14",
              borderRadius: 8,
            }}
          >
            <span style={{ fontSize: 24 }}>{agentEmoji}</span>
            <span>{agentName}</span>
          </div>
        </div>

        {/* Title + blurb */}
        <div
          style={{
            fontFamily: "Luckiest Guy",
            fontSize: hasRows ? 48 : 72,
            lineHeight: 1.1,
            marginBottom: 6,
            maxWidth: 1000,
          }}
        >
          {panel.title}
        </div>
        <div style={{ fontSize: 20, color: "#5c4a3d", marginBottom: 16, maxWidth: 1000 }}>
          {`${panel.blurb}${panelBlurbSuffix(slug, positionFilter, isSnapshot, showingDemoRows, showingLiveData)}`}
        </div>

        {showingDemoRows && LAUNCH_10_OG_SLUGS.has(slug) ? (
          <div
            style={{
              fontFamily: "Caveat",
              fontSize: 32,
              color: "#f7efe5",
              background: "#d97757",
              padding: "6px 18px",
              alignSelf: "flex-start",
              border: "3px solid #2d1f14",
              borderRadius: 10,
              boxShadow: "4px 4px 0 #2d1f14",
              transform: "rotate(2deg)",
              marginBottom: 12,
              fontWeight: 700,
            }}
          >
            {launch10SampleStickerLabel(slug)}
          </div>
        ) : null}

        {showingLiveData && LAUNCH_10_OG_SLUGS.has(slug) ? (
          <div
            style={{
              fontFamily: "Caveat",
              fontSize: 32,
              color: "#f7efe5",
              background: "#2ec4b6",
              padding: "6px 18px",
              alignSelf: "flex-start",
              border: "3px solid #2d1f14",
              borderRadius: 10,
              boxShadow: "4px 4px 0 #2d1f14",
              transform: "rotate(-2deg)",
              marginBottom: 12,
              fontWeight: 700,
            }}
          >
            {launch10LiveStickerLabel(slug)}
          </div>
        ) : null}

        {query && (
          <div
            style={{
              fontFamily: "Caveat",
              fontSize: 28,
              color: "#d97757",
              padding: "4px 14px",
              alignSelf: "flex-start",
              border: "3px solid #2d1f14",
              borderRadius: 10,
              background: "#f7efe5",
              boxShadow: "4px 4px 0 #2d1f14",
              transform: "rotate(-1.5deg)",
              marginBottom: 12,
            }}
          >
            &ldquo;{query}&rdquo;
          </div>
        )}

        {/* Data rows */}
        {hasRows ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 5,
              flex: 1,
              background: "#f7efe5",
              border: "3px solid #2d1f14",
              borderRadius: 8,
              padding: "10px 16px",
              boxShadow: "4px 4px 0 #2d1f14",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 14,
                color: "#8a7565",
                paddingBottom: 5,
                borderBottom: "2px dashed #c4b5a5",
              }}
            >
              <div style={{ width: 32, display: "flex" }}>#</div>
              <div style={{ flex: 1, display: "flex" }}>Player</div>
              <div style={{ width: 52, display: "flex" }}>Pos</div>
              <div style={{ width: 64, display: "flex" }}>Team</div>
              {colHeader && (
                <div style={{ width: 80, textAlign: "right", display: "flex", justifyContent: "flex-end" }}>
                  {colHeader}
                </div>
              )}
            </div>
            {rows.filter((r) => r.name).map((r, i) => (
              <div
                key={`${r.name}-${i}`}
                style={{ display: "flex", alignItems: "center", fontSize: 18 }}
              >
                <div style={{ width: 32, color: "#8a7565", display: "flex" }}>{i + 1}</div>
                <div style={{ flex: 1, fontWeight: 600, overflow: "hidden", display: "flex" }}>
                  {r.name.length > 22 ? `${r.name.slice(0, 20)}…` : r.name}
                </div>
                <div style={{ width: 52, display: "flex" }}>
                  {r.position && (
                    <span
                      style={{
                        background: POS_COLOR[r.position] ?? "#5c4a3d",
                        color: "#f7efe5",
                        padding: "1px 7px",
                        borderRadius: 4,
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {r.position}
                    </span>
                  )}
                </div>
                <div style={{ width: 64, fontSize: 15, color: "#5c4a3d", display: "flex" }}>{r.team}</div>
                {colHeader && (
                  <div style={{ width: 80, textAlign: "right", fontWeight: 700, display: "flex", justifyContent: "flex-end" }}>
                    {formatStat(r.stat, colHeader)}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : null}

        {/* Always-on watermark band — matches Explore OG (T6 screenshot gravity) */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 16,
            padding: "10px 18px",
            background: "#d97757",
            color: "#f7efe5",
            border: "3px solid #2d1f14",
            borderRadius: 8,
            boxShadow: "4px 4px 0 #2d1f14",
            fontSize: 20,
          }}
        >
          <div style={{ display: "flex", fontWeight: 700 }}>razzle.lol/lab/{slug}</div>
          <div style={{ display: "flex", fontFamily: "Caveat", fontSize: 30 }}>
            {`made with 🐯 razzle.lol${isDownload ? " · export" : ""}`}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
