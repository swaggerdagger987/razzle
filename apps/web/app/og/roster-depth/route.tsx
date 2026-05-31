import { ImageResponse } from "next/og";
import { AGENT_BY_ID } from "@razzle/agents";
import {
  decodeBureauRosterDepthOgSnapshot,
  type BureauRosterDepthOgSnapshot,
  type RosterDepthOgPos,
} from "@/lib/bureau-roster-depth-og-snapshot";

export const runtime = "edge";

const POS_COLORS: Record<string, string> = {
  QB: "#5b7fff",
  RB: "#2ec4b6",
  WR: "#d97757",
  TE: "#8b5cf6",
};

const DEMO_SNAPSHOT: BureauRosterDepthOgSnapshot = {
  team: "Dynasty Dukes",
  totalPlayers: 15,
  positions: [
    { pos: "QB", grade: "B", count: 2, elite: 1, topName: "J. Burrow" },
    { pos: "RB", grade: "A", count: 4, elite: 2, topName: "B. Robinson" },
    { pos: "WR", grade: "B", count: 5, elite: 1, topName: "J. Chase" },
    { pos: "TE", grade: "C", count: 1, elite: 0, topName: "S. LaPorta" },
  ],
};

type PosBlock = {
  count?: number;
  elite?: number;
  depth?: Array<{ name?: string; dynasty_value?: number | null }>;
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

function resolveApiOrigin(req: Request): string {
  return new URL(req.url).origin;
}

function panelToSnapshot(
  depth: Record<string, PosBlock>,
  totalPlayers: number,
  team?: string,
): BureauRosterDepthOgSnapshot {
  const positions: RosterDepthOgPos[] = (["QB", "RB", "WR", "TE"] as const).map((pos) => {
    const block = depth[pos] ?? {};
    const top = [...(block.depth ?? [])].sort((a, b) => (b.dynasty_value ?? 0) - (a.dynasty_value ?? 0))[0];
    return {
      pos,
      grade: depthGrade(block),
      count: block.count ?? 0,
      elite: block.elite ?? 0,
      topName: top?.name ?? "—",
    };
  });
  return { team, totalPlayers, positions };
}

async function fetchRosterDepth(
  req: Request,
  league: string,
  user: string,
): Promise<BureauRosterDepthOgSnapshot | null> {
  if (!league || !user) return null;
  try {
    const res = await fetch(`${resolveApiOrigin(req)}/api/bureau/roster-depth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ league_id: league, user_id: user }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      error?: string;
      depth?: Record<string, PosBlock>;
      total_players?: number;
    };
    if (data.error || !data.depth) return null;
    return panelToSnapshot(data.depth, Number(data.total_players ?? 0));
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const isDownload = url.searchParams.get("download") === "1";
  const league = url.searchParams.get("league") ?? "";
  const user = url.searchParams.get("user") ?? "";
  const snapshotParam = url.searchParams.get("snapshot") ?? "";

  const hawkeye = AGENT_BY_ID.hawkeye;
  const fromSnap = snapshotParam ? decodeBureauRosterDepthOgSnapshot(snapshotParam) : null;
  const live = fromSnap ? null : await fetchRosterDepth(req, league, user);
  const snap = fromSnap ?? live;
  const isDemo = !snap || snap.positions.length === 0;
  const card = isDemo ? DEMO_SNAPSHOT : snap;
  const weakest = card.positions.reduce(
    (min, row) => (row.count < min.count ? row : min),
    card.positions[0]!,
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
        <div style={{ display: "flex", fontSize: 20, color: "#5c4a3d", marginBottom: 8 }}>
          {card.team ? `${card.team} · ` : ""}
          {card.totalPlayers ? `${card.totalPlayers} players · ` : ""}
          {isDemo ? "sample preview" : "in-panel snapshot"}
        </div>

        <div
          style={{
            display: "flex",
            fontFamily: "Caveat",
            fontSize: 28,
            color: "#d97757",
            marginBottom: 10,
          }}
        >
          {`${weakest.pos} is your thinnest spot — screenshot for trade threads.`}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, flex: 1, alignContent: "flex-start" }}>
          {card.positions.map((row) => {
            const color = POS_COLORS[row.pos] ?? "#5c4a3d";
            return (
              <div
                key={row.pos}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "48%",
                  background: "#f7efe5",
                  border: "3px solid #2d1f14",
                  borderRadius: 8,
                  padding: "12px 14px",
                  boxShadow: "4px 4px 0 #2d1f14",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div
                    style={{
                      display: "flex",
                      fontSize: 18,
                      fontWeight: 700,
                      color,
                      border: `2px solid ${color}`,
                      padding: "2px 10px",
                      borderRadius: 4,
                    }}
                  >
                    {row.pos}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      fontFamily: "Luckiest Guy",
                      fontSize: 40,
                      color,
                      transform: "rotate(-3deg)",
                    }}
                  >
                    {row.grade}
                  </div>
                </div>
                <div style={{ display: "flex", fontSize: 14, color: "#5c4a3d", marginTop: 6 }}>
                  {`${row.count} rostered · ${row.elite} elite`}
                </div>
                <div style={{ display: "flex", fontSize: 16, fontWeight: 700, marginTop: 4 }}>{row.topName}</div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 18,
            color: "#5c4a3d",
            marginTop: 10,
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
