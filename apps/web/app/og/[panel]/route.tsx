import { ImageResponse } from "next/og";
import { getPanel } from "@razzle/panels";
import { agentForPanel } from "@razzle/agents";

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
  "trade_value",
  "value",
  "ppg",
  "fpts",
  "score",
  "rbs_score",
  "breakout_score",
  "rps",
  "similarity",
  "rank_diff",
  "composite_score",
  "efficiency_score",
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

/** Panel-specific stat for OG ranking (matches in-product Lab renderers). */
const PANEL_OG_STAT_KEY: Record<string, string> = {
  weekly: "ppg",
  prospects: "rps",
  breakouts: "breakout_score",
};

/** Launch-10 Lab panels — live OG cards use panel blurb only (no sample/live suffix). */
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

function panelBlurbSuffix(
  slug: string,
  positionFilter: string,
  isSnapshot: boolean,
  showingDemoRows: boolean,
  showingLiveData: boolean,
): string {
  const pos = positionFilter ? ` · ${positionFilter} only` : "";
  if (slug === "dynasty-comps" && showingDemoRows) {
    return `${pos} · comps for Ja'Marr Chase · sample preview`;
  }
  if (isSnapshot) {
    return `${pos} · from your panel`;
  }
  if (showingDemoRows) {
    return `${pos} · sample preview`;
  }
  if (showingLiveData && LAUNCH_10_OG_SLUGS.has(slug)) {
    return pos;
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
    { name: "Travis Hunter", position: "WR", team: "JAX", stat: 94, statLabel: "Score" },
    { name: "Cam Ward", position: "QB", team: "TEN", stat: 91, statLabel: "Score" },
    { name: "Ashton Jeanty", position: "RB", team: "LV", stat: 89, statLabel: "Score" },
    { name: "Tyler Warren", position: "TE", team: "IND", stat: 86, statLabel: "Score" },
    { name: "Tre Harris", position: "WR", team: "LAC", stat: 83, statLabel: "Score" },
    { name: "Emeka Egbuka", position: "WR", team: "TB", stat: 80, statLabel: "Score" },
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
    { name: "Rome Odunze", position: "WR", team: "CHI", stat: 92, statLabel: "Score" },
    { name: "Ladd McConkey", position: "WR", team: "LAC", stat: 88, statLabel: "Score" },
    { name: "Marvin Harrison Jr.", position: "WR", team: "ARI", stat: 85, statLabel: "Score" },
    { name: "Malik Nabers", position: "WR", team: "NYG", stat: 81, statLabel: "Score" },
    { name: "Brian Thomas Jr.", position: "WR", team: "JAX", stat: 78, statLabel: "Score" },
    { name: "Xavier Worthy", position: "WR", team: "KC", stat: 74, statLabel: "Score" },
  ],
  gamelog: [
    { name: "Ja'Marr Chase", position: "WR", team: "CIN", stat: 28.4, statLabel: "FPTS" },
    { name: "Bijan Robinson", position: "RB", team: "ATL", stat: 19.2, statLabel: "FPTS" },
    { name: "Brock Bowers", position: "TE", team: "LV", stat: 14.6, statLabel: "FPTS" },
    { name: "Jayden Daniels", position: "QB", team: "WAS", stat: 31.1, statLabel: "FPTS" },
    { name: "Marvin Harrison Jr.", position: "WR", team: "ARI", stat: 11.8, statLabel: "FPTS" },
    { name: "Brian Thomas Jr.", position: "WR", team: "JAX", stat: 22.5, statLabel: "FPTS" },
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

function demoRowsForPanel(slug: string): OgRow[] {
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

function statLabelForKey(k: string): string {
  let statLabel = k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  if (k === "fantasy_points_ppr") statLabel = "FPTS";
  if (k === "ppg") statLabel = "PPG";
  if (k === "rps") statLabel = "RPS";
  if (k === "dynasty_value" || k === "trade_value" || k === "value") statLabel = "Value";
  if (k === "rbs_score" || k === "breakout_score") statLabel = "Score";
  if (k === "similarity") statLabel = "Match %";
  if (k === "rank_diff") statLabel = "Chg";
  return statLabel;
}

function extractRows(data: unknown, slug?: string): OgRow[] {
  if (!data || typeof data !== "object") return [];

  const obj = data as Record<string, unknown>;
  let candidates: Record<string, unknown>[] = [];

  if (Array.isArray(obj.items)) {
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
  } else if (Array.isArray(obj.top5) || Array.isArray(obj.risers)) {
    const top5 = Array.isArray(obj.top5) ? (obj.top5 as Record<string, unknown>[]) : [];
    const risers = Array.isArray(obj.risers) ? (obj.risers as Record<string, unknown>[]) : [];
    candidates = [...top5, ...risers];
  } else if (Array.isArray(data)) {
    candidates = data as Record<string, unknown>[];
  }

  if (candidates.length === 0) return [];

  const preferredKey = slug ? PANEL_OG_STAT_KEY[slug] : undefined;
  const statKeys = preferredKey
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
    return extractRows(await res.json(), slug);
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
    return extractRows(data, slug);
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
  }
  const snapshotRows = snapshotParam ? decodeOgSnapshot(snapshotParam) : [];
  const snapshotHasRows =
    snapshotRows.length > 0 && snapshotRows.some((r) => r.name);
  let liveRows: OgRow[] = [];
  if (apiPath && !snapshotHasRows) {
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

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 20,
            color: "#5c4a3d",
            marginTop: 14,
          }}
        >
          <div style={{ display: "flex" }}>razzle.lol/lab/{slug}</div>
          {isDownload ? (
            <div style={{ display: "flex", fontFamily: "Caveat", fontSize: 28, color: "#d97757" }}>
              made with 🐯 razzle.lol
            </div>
          ) : null}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
