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

async function fetchTopPlayers(params: {
  universe: string;
  sort: string;
  dir: string;
  q: string;
  pos: string;
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
    teams: [],
    season: 0,
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

function statLabel(universe: string, sort: string): string {
  if (sort.startsWith("formula_")) {
    return sort.replace("formula_", "").replace(/_/g, " ");
  }
  if (universe === "college") return sort === "total_yards" ? "Yards" : sort.replace(/_/g, " ");
  if (sort === "fantasy_points_ppr") return "FPTS";
  return sort.replace(/_/g, " ");
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const isDownload = url.searchParams.get("download") === "1";
  const universe = url.searchParams.get("universe") ?? "nfl";
  const sort = url.searchParams.get("sort") ?? "fantasy_points_ppr";
  const dir = url.searchParams.get("dir") ?? "desc";
  const q = url.searchParams.get("q") ?? "";
  const pos = url.searchParams.get("pos") ?? "";

  const title = universe === "college" ? "College Screener" : "Dynasty Screener";
  const subtitle = [pos && `${pos} only`, sort.replace(/_/g, " "), q && `"${q}"`]
    .filter(Boolean)
    .join(" · ");
  const colHeader = statLabel(universe, sort);

  const players = await fetchTopPlayers({ universe, sort, dir, q, pos });

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

        <div style={{ fontFamily: "Luckiest Guy", fontSize: 56, marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 22, color: "#5c4a3d", marginBottom: 20 }}>
          {subtitle || "filter any stat · build any view"}
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
        ) : (
          <div style={{ flex: 1, fontSize: 24, color: "#5c4a3d" }}>pulling film…</div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 22,
            color: "#5c4a3d",
            marginTop: 16,
          }}
        >
          <div style={{ display: "flex" }}>razzle.lol/explore</div>
          {isDownload ? (
            <div style={{ display: "flex", fontFamily: "Caveat", fontSize: 32, color: "#d97757" }}>
              made with 🐯 razzle.lol
            </div>
          ) : null}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
