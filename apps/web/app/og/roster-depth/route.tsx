import { ImageResponse } from "next/og";
import { AGENT_BY_ID } from "@razzle/agents";

export const runtime = "edge";

const POS_COLOR: Record<string, string> = {
  QB: "#5b7fff",
  RB: "#2ec4b6",
  WR: "#d97757",
  TE: "#8b5cf6",
};

type PosRow = {
  position: string;
  count: number;
  elite: number;
  grade: string;
};

type DepthBlock = {
  count?: number;
  elite?: number;
};

type DepthData = {
  depth?: Record<string, DepthBlock>;
  total_players?: number;
  error?: string;
};

const DEMO_ROWS: PosRow[] = [
  { position: "QB", count: 2, elite: 1, grade: "B" },
  { position: "RB", count: 5, elite: 2, grade: "A" },
  { position: "WR", count: 7, elite: 2, grade: "A" },
  { position: "TE", count: 1, elite: 0, grade: "D" },
];

const POS_ORDER = ["QB", "RB", "WR", "TE"] as const;

function depthGrade(block: DepthBlock): string {
  const count = block.count ?? 0;
  const elite = block.elite ?? 0;
  if (count === 0) return "F";
  if (elite >= 2 || (elite >= 1 && count >= 4)) return "A";
  if (elite >= 1 || count >= 3) return "B";
  if (count >= 2) return "C";
  return "D";
}

function rowsFromDepth(depth: Record<string, DepthBlock>): PosRow[] {
  return POS_ORDER.map((position) => {
    const block = depth[position] ?? {};
    return {
      position,
      count: block.count ?? 0,
      elite: block.elite ?? 0,
      grade: depthGrade(block),
    };
  });
}

async function fetchRosterDepth(leagueId: string, userId: string): Promise<DepthData | null> {
  const apiOrigin = process.env.NEXT_PUBLIC_API_ORIGIN || "http://127.0.0.1:8000";
  if (!leagueId || !userId) return null;

  try {
    const res = await fetch(`${apiOrigin}/api/bureau/roster-depth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ league_id: leagueId, user_id: userId }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as DepthData;
    if (data.error || !data.depth) return null;
    return data;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const isDownload = url.searchParams.get("download") === "1";
  const league = url.searchParams.get("league") ?? "";
  const user = url.searchParams.get("user") ?? "";

  const hawkeye = AGENT_BY_ID.hawkeye;
  const live = await fetchRosterDepth(league, user);
  const isDemo = !live?.depth;
  const rows = isDemo ? DEMO_ROWS : rowsFromDepth(live!.depth!);
  const totalPlayers = isDemo ? 15 : Number(live?.total_players ?? 0);
  let weakest: PosRow = rows[0] ?? DEMO_ROWS[0]!;
  for (const row of rows) {
    if (row.count < weakest.count) weakest = row;
  }

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
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
          <div style={{ fontSize: 48, display: "flex" }}>🐯</div>
          <div style={{ display: "flex", fontSize: 36, fontWeight: 700 }}>
            <span style={{ display: "flex" }}>Razzle</span>
            <span style={{ display: "flex", color: "#d97757" }}>.lol</span>
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
            <span style={{ display: "flex", fontSize: 24 }}>{hawkeye.emoji}</span>
            <span style={{ display: "flex" }}>{hawkeye.name}</span>
          </div>
        </div>

        <div style={{ display: "flex", fontFamily: "Luckiest Guy", fontSize: 56, lineHeight: 1.1, marginBottom: 4 }}>
          Roster Depth
        </div>
        <div style={{ display: "flex", fontSize: 20, color: "#5c4a3d", marginBottom: 14 }}>
          {`position grades · ${totalPlayers} rostered${isDemo ? " · sample preview" : ""}`}
        </div>

        {weakest ? (
          <div
            style={{
              display: "flex",
              fontFamily: "Caveat",
              fontSize: 30,
              color: "#d97757",
              marginBottom: 12,
            }}
          >
            {`thinnest: ${weakest.position} (${weakest.count} deep) — grade ${weakest.grade}`}
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            flex: 1,
            background: "#f7efe5",
            border: "3px solid #2d1f14",
            borderRadius: 8,
            padding: "16px 20px",
            boxShadow: "4px 4px 0 #2d1f14",
          }}
        >
          {rows.map((row) => {
            const color = POS_COLOR[row.position] ?? "#d97757";
            const barWidth = Math.min(100, Math.max(14, row.count * 14));
            return (
              <div key={row.position} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    display: "flex",
                    width: 44,
                    height: 44,
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#f7efe5",
                    background: color,
                    border: "3px solid #2d1f14",
                    borderRadius: 8,
                  }}
                >
                  {row.position}
                </div>
                <div style={{ display: "flex", flex: 1, flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", fontSize: 18, fontWeight: 700 }}>
                    {`${row.count} rostered · ${row.elite} elite`}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      height: 16,
                      background: "#e5d6c4",
                      borderRadius: 4,
                      overflow: "hidden",
                      border: "2px solid #2d1f14",
                    }}
                  >
                    <div style={{ display: "flex", width: `${barWidth}%`, background: color }} />
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    fontFamily: "Luckiest Guy",
                    fontSize: 36,
                    width: 52,
                    justifyContent: "center",
                    color,
                    transform: "rotate(-4deg)",
                  }}
                >
                  {row.grade}
                </div>
              </div>
            );
          })}
        </div>

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
          <div style={{ display: "flex" }}>{`razzle.lol/league${league ? `/${league}` : ""}/roster-depth`}</div>
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
