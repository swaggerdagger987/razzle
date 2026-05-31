import { ImageResponse } from "next/og";

export const runtime = "edge";

const POS_COLOR: Record<string, string> = {
  QB: "#5b7fff",
  RB: "#2ec4b6",
  WR: "#d97757",
  TE: "#8b5cf6",
};

interface OgPlayer {
  full_name: string;
  position: string;
  team: string;
  stat: number;
}

/** Sample screener rows when API/terminal.db unavailable (FACTORY-DOD Gate C). */
const DEMO_NFL_ROWS: OgPlayer[] = [
  { full_name: "Jayden Daniels", position: "QB", team: "WAS", stat: 312.4 },
  { full_name: "Ja'Marr Chase", position: "WR", team: "CIN", stat: 298.1 },
  { full_name: "Bijan Robinson", position: "RB", team: "ATL", stat: 285.6 },
  { full_name: "Brock Bowers", position: "TE", team: "LV", stat: 241.2 },
  { full_name: "Brian Thomas Jr.", position: "WR", team: "JAX", stat: 228.4 },
  { full_name: "Marvin Harrison Jr.", position: "WR", team: "ARI", stat: 215.8 },
];

const DEMO_COLLEGE_ROWS: OgPlayer[] = [
  { full_name: "Cam Ward", position: "QB", team: "MIA", stat: 4120 },
  { full_name: "Travis Hunter", position: "WR", team: "COLO", stat: 1189 },
  { full_name: "Ashton Jeanty", position: "RB", team: "BOISE", stat: 1924 },
  { full_name: "Tyler Warren", position: "TE", team: "PSU", stat: 812 },
  { full_name: "Tre Harris", position: "WR", team: "OLE MISS", stat: 1056 },
  { full_name: "Emeka Egbuka", position: "WR", team: "OSU", stat: 989 },
];

function demoRowsForExplore(universe: string): OgPlayer[] {
  return universe === "college" ? DEMO_COLLEGE_ROWS : DEMO_NFL_ROWS;
}

function parseTeams(teamParam: string): string[] {
  if (!teamParam) return [];
  return teamParam
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

/** Band link mirrors nuqs explore state so OG screenshots route back to the same view. */
function buildExplorePageLink(params: {
  universe: string;
  sort: string;
  dir: string;
  q: string;
  pos: string;
  season: number;
  team: string;
}): string {
  const sp = new URLSearchParams();
  if (params.universe === "college") sp.set("universe", "college");
  const defaultSort = params.universe === "college" ? "total_yards" : "fantasy_points_ppr";
  if (params.sort && params.sort !== defaultSort) sp.set("sort", params.sort);
  if (params.dir && params.dir !== "desc") sp.set("dir", params.dir);
  if (params.q) sp.set("q", params.q);
  if (params.pos) sp.set("pos", params.pos);
  if (params.season > 0) sp.set("season", String(params.season));
  if (params.team) sp.set("team", params.team);
  const qs = sp.toString();
  return qs ? `razzle.lol/explore?${qs}` : "razzle.lol/explore";
}

async function fetchTopPlayers(params: {
  universe: string;
  sort: string;
  dir: string;
  q: string;
  pos: string;
  season: number;
  teams: string[];
}): Promise<OgPlayer[]> {
  const apiOrigin = process.env.NEXT_PUBLIC_API_ORIGIN || "http://127.0.0.1:8000";
  let sortKey = params.sort;
  if (params.universe === "college" && sortKey === "fantasy_points_ppr") {
    sortKey = "total_yards";
  }
  if (sortKey.startsWith("formula_")) {
    sortKey = params.universe === "college" ? "total_yards" : "fantasy_points_ppr";
  }

  const positions = params.pos
    ? params.pos.split(",").map((p) => p.trim()).filter(Boolean)
    : [];

  const body = {
    search: params.q,
    positions,
    teams: params.teams,
    season: params.season > 0 ? params.season : 0,
    week: 0,
    sort_key: sortKey,
    sort_direction: params.dir === "asc" ? "asc" : "desc",
    limit: 6,
    offset: 0,
    filters: [],
    relevance: "fantasy",
    min_gp: 0,
    universe: params.universe,
  };

  try {
    const res = await fetch(`${apiOrigin}/api/screener/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { items?: Record<string, unknown>[] };
    return (data.items ?? []).map((row) => ({
      full_name: String(row.full_name ?? ""),
      position: String(row.position ?? ""),
      team: String(row.team ?? ""),
      stat: Number(row[sortKey] ?? row.fantasy_points_ppr ?? row.total_yards ?? 0),
    }));
  } catch {
    return [];
  }
}

function formulaSortLabel(sort: string): string {
  return sort.replace("formula_", "").replace(/_/g, " ");
}

function statLabel(universe: string, sort: string): string {
  if (sort.startsWith("formula_")) {
    return formulaSortLabel(sort);
  }
  if (universe === "college") return sort === "total_yards" ? "Yards" : sort.replace(/_/g, " ");
  if (sort === "fantasy_points_ppr") return "FPTS";
  return sort.replace(/_/g, " ");
}

function effectiveSortKey(universe: string, sort: string): string {
  if (universe === "college" && (sort === "fantasy_points_ppr" || sort.startsWith("formula_"))) {
    return "total_yards";
  }
  return sort;
}

function resolveApiSort(universe: string, sort: string, apiSortParam: string): string {
  const raw = apiSortParam || sort;
  if (raw.startsWith("formula_")) {
    return effectiveSortKey(universe, raw);
  }
  return raw;
}

function buildSubtitle(
  universe: string,
  sort: string,
  apiSort: string,
  pos: string,
  q: string,
): string {
  const formulaSort = sort.startsWith("formula_");
  const apiDiffers = formulaSort && apiSort !== sort;
  const displaySortKey = apiDiffers ? apiSort : sort;
  const sortKey = effectiveSortKey(universe, displaySortKey);
  const parts: string[] = [];
  if (formulaSort) {
    parts.push(`sorted by ${formulaSortLabel(sort)}`);
    if (apiDiffers) {
      parts.push(`rows ranked by ${statLabel(universe, sortKey)}`);
    }
  }
  if (pos) parts.push(`${pos} only`);
  const isDefaultSort =
    universe === "college" ? sortKey === "total_yards" : sortKey === "fantasy_points_ppr";
  if (!formulaSort && (!isDefaultSort || pos || q)) {
    parts.push(statLabel(universe, sortKey));
  }
  if (q) parts.push(`"${q}"`);
  if (parts.length) return parts.join(" · ");
  return universe === "college"
    ? "college stats · filter any stat · build any view"
    : "filter any stat · build any view";
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const isDownload = url.searchParams.get("download") === "1";
  const forceDemo = url.searchParams.get("force_demo") === "1";
  const universe = url.searchParams.get("universe") ?? "nfl";
  const sort = url.searchParams.get("sort") ?? "fantasy_points_ppr";
  const apiSort = resolveApiSort(
    universe,
    sort,
    url.searchParams.get("api_sort") ?? "",
  );
  const dir = url.searchParams.get("dir") ?? "desc";
  const q = url.searchParams.get("q") ?? "";
  const pos = url.searchParams.get("pos") ?? "";
  const team = url.searchParams.get("team") ?? "";
  const season = Number(url.searchParams.get("season") ?? "0") || 0;
  const teams = parseTeams(team);

  const title = universe === "college" ? "College Screener" : "Dynasty Screener";
  const formulaSort = sort.startsWith("formula_");
  const subtitle = buildSubtitle(universe, sort, apiSort, pos, q);
  const colHeader = formulaSort
    ? formulaSortLabel(sort)
    : statLabel(universe, effectiveSortKey(universe, sort));
  const exploreLink = buildExplorePageLink({ universe, sort, dir, q, pos, season, team });

  const livePlayers = forceDemo
    ? []
    : await fetchTopPlayers({ universe, sort: apiSort, dir, q, pos, season, teams });
  const isDemo = forceDemo || livePlayers.length === 0;
  const players = isDemo ? demoRowsForExplore(universe) : livePlayers;

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
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <div style={{ fontSize: 52, display: "flex" }}>🐯</div>
          <div style={{ display: "flex", fontSize: 38, fontWeight: 700 }}>
            Razzle<span style={{ color: "#d97757" }}>.lol</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div style={{ fontFamily: "Luckiest Guy", fontSize: 56, display: "flex" }}>{title}</div>
          {formulaSort ? (
            <div
              style={{
                display: "flex",
                fontSize: 16,
                fontWeight: 700,
                background: "#5b7fff",
                color: "#f7efe5",
                padding: "4px 12px",
                border: "3px solid #2d1f14",
                borderRadius: 6,
                boxShadow: "3px 3px 0 #2d1f14",
              }}
            >
              FORMULA SORT
            </div>
          ) : null}
          {isDemo ? (
            <div
              style={{
                display: "flex",
                fontSize: 16,
                fontWeight: 700,
                background: "#d97757",
                color: "#f7efe5",
                padding: "4px 12px",
                border: "3px solid #2d1f14",
                borderRadius: 6,
                boxShadow: "3px 3px 0 #2d1f14",
              }}
            >
              SAMPLE · not live data
            </div>
          ) : null}
        </div>
        <div style={{ fontSize: 22, color: "#5c4a3d", marginBottom: 20 }}>
          {isDemo
            ? `${subtitle} · SAMPLE rows — not live nflverse`
            : subtitle}
        </div>

        {players.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              flex: 1,
              background: "#f7efe5",
              border: "3px solid #2d1f14",
              borderRadius: 8,
              padding: "12px 16px",
              boxShadow: "4px 4px 0 #2d1f14",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 16,
                color: "#8a7565",
                paddingBottom: 6,
                borderBottom: "2px dashed #c4b5a5",
              }}
            >
              <div style={{ width: 36, display: "flex" }}>#</div>
              <div style={{ flex: 1, display: "flex" }}>Player</div>
              <div style={{ width: 56, display: "flex" }}>Pos</div>
              <div style={{ width: 72, display: "flex" }}>{universe === "college" ? "School" : "Team"}</div>
              <div style={{ width: 80, textAlign: "right", display: "flex" }}>{colHeader}</div>
            </div>
            {players.map((p, i) => (
              <div
                key={`${p.full_name}-${i}`}
                style={{ display: "flex", alignItems: "center", fontSize: 20 }}
              >
                <div style={{ width: 36, color: "#8a7565", display: "flex" }}>{i + 1}</div>
                <div style={{ flex: 1, fontWeight: 600, overflow: "hidden", display: "flex" }}>
                  {p.full_name.length > 22 ? `${p.full_name.slice(0, 20)}…` : p.full_name}
                </div>
                <div style={{ width: 56, display: "flex" }}>
                  <span
                    style={{
                      background: POS_COLOR[p.position] ?? "#5c4a3d",
                      color: "#f7efe5",
                      padding: "2px 8px",
                      borderRadius: 4,
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    {p.position}
                  </span>
                </div>
                <div style={{ width: 72, fontSize: 16, color: "#5c4a3d", display: "flex" }}>{p.team}</div>
                <div style={{ width: 80, textAlign: "right", fontWeight: 700, display: "flex" }}>
                  {p.stat % 1 === 0 ? p.stat : p.stat.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Always-on watermark band — visible on preview + download (T6 screenshot gravity) */}
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
          <div style={{ display: "flex", fontWeight: 700 }}>{exploreLink}</div>
          <div style={{ display: "flex", fontFamily: "Caveat", fontSize: 30 }}>
            made with 🐯 razzle.lol
            {isDownload ? " · export" : ""}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
