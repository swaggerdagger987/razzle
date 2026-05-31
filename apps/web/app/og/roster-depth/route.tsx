import { ImageResponse } from "next/og";
import { AGENT_BY_ID } from "@razzle/agents";

export const runtime = "edge";

type DepthPlayer = {
  player_id: string;
  name: string;
  position: string;
  dynasty_value?: number | null;
};

type PosBlock = {
  count?: number;
  elite?: number;
  depth?: DepthPlayer[];
};

type RosterDepthData = {
  league_id?: string;
  user_id?: string;
  depth?: Record<string, PosBlock>;
  total_players?: number;
  error?: string;
};

const POS_ORDER = ["QB", "RB", "WR", "TE"] as const;

const POS_COLORS: Record<string, string> = {
  QB: "#5b7fff",
  RB: "#2ec4b6",
  WR: "#d97757",
  TE: "#8b5cf6",
};

const DEMO_DEPTH: Record<string, PosBlock> = {
  QB: {
    count: 2,
    elite: 1,
    depth: [{ player_id: "1", name: "Patrick Mahomes", position: "QB", dynasty_value: 92 }],
  },
  RB: {
    count: 4,
    elite: 2,
    depth: [
      { player_id: "2", name: "Breece Hall", position: "RB", dynasty_value: 88 },
      { player_id: "3", name: "Kenneth Walker", position: "RB", dynasty_value: 72 },
    ],
  },
  WR: {
    count: 5,
    elite: 1,
    depth: [
      { player_id: "4", name: "Ja'Marr Chase", position: "WR", dynasty_value: 95 },
      { player_id: "5", name: "Amon-Ra St. Brown", position: "WR", dynasty_value: 84 },
    ],
  },
  TE: {
    count: 1,
    elite: 0,
    depth: [{ player_id: "6", name: "Sam LaPorta", position: "TE", dynasty_value: 68 }],
  },
};

function depthGrade(block: PosBlock): string {
  const count = block.count ?? 0;
  const elite = block.elite ?? 0;
  if (count === 0) return "F";
  if (elite >= 2 || (elite >= 1 && count >= 4)) return "A";
  if (elite >= 1 || count >= 3) return "B";
  if (count >= 2) return "C";
  return "D";
}

async function fetchRosterDepth(leagueId: string, userId: string): Promise<RosterDepthData | null> {
  const apiOrigin = process.env.NEXT_PUBLIC_API_ORIGIN || "http://127.0.0.1:8000";
  if (!leagueId || !userId) return null;

  try {
    const res = await fetch(`${apiOrigin}/api/bureau/roster-depth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ league_id: leagueId, user_id: userId }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as RosterDepthData;
    if (data.error || !data.depth) return null;
    return data;
  } catch {
    return null;
  }
}

function topPlayer(block: PosBlock): string {
  const players = [...(block.depth ?? [])].sort(
    (a, b) => (b.dynasty_value ?? 0) - (a.dynasty_value ?? 0),
  );
  if (!players.length) return "—";
  const name = players[0].name;
  return name.length > 18 ? `${name.slice(0, 16)}…` : name;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const isDownload = url.searchParams.get("download") === "1";
  const league = url.searchParams.get("league") ?? "";
  const user = url.searchParams.get("user") ?? "";

  const hawkeye = AGENT_BY_ID.hawkeye;
  const live = await fetchRosterDepth(league, user);
  const isDemo = !live?.depth;
  const depth = isDemo ? DEMO_DEPTH : live!.depth!;
  const totalPlayers = isDemo ? 12 : (live?.total_players ?? 0);

  const weakest = POS_ORDER.reduce(
    (min, pos) => ((depth[pos]?.count ?? 0) < (depth[min]?.count ?? 0) ? pos : min),
    "QB" as (typeof POS_ORDER)[number],
  );

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
          {`${totalPlayers} players · thinnest at ${weakest}${isDemo ? " · sample preview" : ""}`}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            flex: 1,
            background: "#f7efe5",
            border: "3px solid #2d1f14",
            borderRadius: 8,
            padding: "14px 18px",
            boxShadow: "4px 4px 0 #2d1f14",
          }}
        >
          {POS_ORDER.map((pos) => {
            const block = depth[pos] ?? {};
            const grade = depthGrade(block);
            const color = POS_COLORS[pos] ?? "#5c4a3d";
            return (
              <div key={pos} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    display: "flex",
                    width: 52,
                    height: 52,
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    fontWeight: 700,
                    color,
                    border: `3px solid ${color}`,
                    borderRadius: 8,
                    fontFamily: "Luckiest Guy",
                  }}
                >
                  {grade}
                </div>
                <div style={{ display: "flex", width: 48, fontSize: 16, fontWeight: 700, color }}>
                  {pos}
                </div>
                <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
                  <div style={{ display: "flex", fontSize: 18, fontWeight: 700 }}>{topPlayer(block)}</div>
                  <div style={{ display: "flex", fontSize: 14, color: "#8a7565" }}>
                    {`${block.count ?? 0} rostered · ${block.elite ?? 0} elite`}
                  </div>
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
