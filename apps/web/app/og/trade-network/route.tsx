import { ImageResponse } from "next/og";
import { AGENT_BY_ID } from "@razzle/agents";

export const runtime = "edge";

type Node = { roster_id: number; team: string };
type Edge = { source: number; target: number; trades: number };

type TradeNetworkData = {
  nodes?: Node[];
  edges?: Edge[];
  error?: string;
};

const DEMO_NODES: Node[] = [
  { roster_id: 1, team: "Rebuild FC" },
  { roster_id: 2, team: "Win-Now LLC" },
  { roster_id: 3, team: "Dynasty Dukes" },
  { roster_id: 4, team: "Comfort Crew" },
  { roster_id: 5, team: "Pick Hoarders" },
];

const DEMO_EDGES: Edge[] = [
  { source: 1, target: 2, trades: 7 },
  { source: 2, target: 4, trades: 5 },
  { source: 1, target: 3, trades: 4 },
  { source: 3, target: 5, trades: 3 },
];

async function fetchTradeNetwork(leagueId: string): Promise<TradeNetworkData | null> {
  const apiOrigin = process.env.NEXT_PUBLIC_API_ORIGIN || "http://127.0.0.1:8000";
  if (!leagueId) return null;

  try {
    const res = await fetch(`${apiOrigin}/api/bureau/trade-network`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ league_id: leagueId }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as TradeNetworkData;
    if (data.error || !data.edges?.length) return null;
    return data;
  } catch {
    return null;
  }
}

function teamLabel(name: string): string {
  return name.length > 14 ? `${name.slice(0, 12)}…` : name;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const isDownload = url.searchParams.get("download") === "1";
  const league = url.searchParams.get("league") ?? "";

  const bones = AGENT_BY_ID.bones;
  const live = await fetchTradeNetwork(league);
  const isDemo = !live?.edges?.length;
  const nodes = isDemo ? DEMO_NODES : live!.nodes ?? [];
  const edges = (isDemo ? DEMO_EDGES : live!.edges!).slice(0, 4);
  const teamById = new Map(nodes.map((n) => [n.roster_id, n.team]));
  const hero = isDemo
    ? DEMO_EDGES[0]
    : edges[0] ?? null;
  const heroSource = hero ? teamById.get(hero.source) ?? `Team ${hero.source}` : null;
  const heroTarget = hero ? teamById.get(hero.target) ?? `Team ${hero.target}` : null;
  const heroTrades = hero?.trades ?? 0;
  const managerCount = isDemo ? DEMO_NODES.length : nodes.length;

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
            <span style={{ display: "flex", fontSize: 24 }}>{bones.emoji}</span>
            <span style={{ display: "flex" }}>{bones.name}</span>
          </div>
        </div>

        <div style={{ display: "flex", fontFamily: "Luckiest Guy", fontSize: 56, lineHeight: 1.1, marginBottom: 4 }}>
          Trade Network
        </div>
        <div style={{ display: "flex", fontSize: 20, color: "#5c4a3d", marginBottom: 10 }}>
          {`${edges.length} partnerships · ${managerCount} managers`}
          {isDemo ? " · sample preview" : ""}
        </div>

        {heroSource && heroTarget ? (
          <div
            style={{
              display: "flex",
              fontFamily: "Caveat",
              fontSize: 28,
              color: "#d97757",
              marginBottom: 10,
            }}
          >
            {`${heroSource} ↔ ${heroTarget} — ${heroTrades} trades. Collusion or best friends?`}
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            flex: 1,
            background: "#f7efe5",
            border: "3px solid #2d1f14",
            borderRadius: 8,
            padding: "12px 16px",
            boxShadow: "4px 4px 0 #2d1f14",
          }}
        >
          {edges.map((edge, i) => {
            const source = teamById.get(edge.source) ?? `Team ${edge.source}`;
            const target = teamById.get(edge.target) ?? `Team ${edge.target}`;
            const laneColor = i === 0 ? "#d97757" : "#5c4a3d";
            return (
              <div
                key={`${edge.source}-${edge.target}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  background: "#ede0cf",
                  border: "2px solid #2d1f14",
                  borderRadius: 6,
                }}
              >
                <div style={{ display: "flex", fontSize: 20, fontWeight: 700, color: laneColor }}>
                  {`${teamLabel(source)} ↔ ${teamLabel(target)}`}
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#f7efe5",
                    background: laneColor,
                    padding: "4px 10px",
                    border: "2px solid #2d1f14",
                    borderRadius: 4,
                  }}
                >
                  {`${edge.trades} trade${edge.trades === 1 ? "" : "s"}`}
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
            marginTop: 12,
          }}
        >
          <div style={{ display: "flex" }}>{`razzle.lol/league${league ? `/${league}` : ""}/trade-network`}</div>
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
