import { ImageResponse } from "next/og";
import { AGENT_BY_ID } from "@razzle/agents";

export const runtime = "edge";

type PowerRow = {
  rank: number;
  team: string;
  record: string;
  differential: number;
  luck: number;
};

const DEMO_ROWS: PowerRow[] = [
  { rank: 1, team: "Dynasty Dukes", record: "9-4", differential: 14, luck: 1.2 },
  { rank: 2, team: "Win-Now LLC", record: "8-5", differential: 6, luck: -0.4 },
  { rank: 3, team: "Your Squad", record: "7-6", differential: 2, luck: 0.8 },
  { rank: 4, team: "Rebuild FC", record: "4-9", differential: -11, luck: -1.1 },
  { rank: 5, team: "Comfort Crew", record: "6-7", differential: -3, luck: 0.2 },
];

type PowerData = {
  rows?: Array<{
    rank: number;
    team: string;
    record: string;
    differential: number;
    luck: number;
  }>;
  error?: string;
};

async function fetchPowerRankings(leagueId: string): Promise<PowerData | null> {
  const apiOrigin = process.env.NEXT_PUBLIC_API_ORIGIN || "http://127.0.0.1:8000";
  if (!leagueId) return null;

  try {
    const res = await fetch(`${apiOrigin}/api/bureau/power-rankings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ league_id: leagueId }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as PowerData;
    if (data.error || !data.rows?.length) return null;
    return data;
  } catch {
    return null;
  }
}

function barColor(diff: number): string {
  if (diff >= 8) return "#2ec4b6";
  if (diff >= 0) return "#d97757";
  return "#e63946";
}

function teamLabel(name: string): string {
  return name.length > 16 ? `${name.slice(0, 14)}…` : name;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const isDownload = url.searchParams.get("download") === "1";
  const league = url.searchParams.get("league") ?? "";

  const octo = AGENT_BY_ID.octo;
  const live = await fetchPowerRankings(league);
  const isDemo = !live?.rows?.length;
  const rows: PowerRow[] = (isDemo ? DEMO_ROWS : live!.rows!).slice(0, 5).map((r) => ({
    rank: r.rank,
    team: r.team,
    record: r.record,
    differential: r.differential,
    luck: r.luck,
  }));

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
            <span style={{ fontSize: 24 }}>{octo.emoji}</span>
            <span>{octo.name}</span>
          </div>
        </div>

        <div style={{ display: "flex", fontFamily: "Luckiest Guy", fontSize: 56, lineHeight: 1.1, marginBottom: 4 }}>
          Power Rankings
        </div>
        <div style={{ display: "flex", fontSize: 20, color: "#5c4a3d", marginBottom: 20 }}>
          {`scoring differential + luck index${isDemo ? " · sample preview" : ""}`}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
          {rows.map((row) => {
            const color = barColor(row.differential);
            const barW = Math.min(100, Math.max(12, 50 + row.differential * 3));
            return (
              <div
                key={`${row.rank}-${row.team}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  background: "#f7efe5",
                  border: "3px solid #2d1f14",
                  borderRadius: 8,
                  padding: "12px 16px",
                  boxShadow: "4px 4px 0 #2d1f14",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", fontFamily: "Luckiest Guy", fontSize: 26 }}>
                    #{row.rank} {teamLabel(row.team)}
                  </div>
                  <div style={{ display: "flex", fontSize: 16, color: "#8a7565" }}>{row.record}</div>
                </div>
                <div
                  style={{
                    display: "flex",
                    height: 14,
                    background: "#ede0cf",
                    border: "2px solid #2d1f14",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div style={{ display: "flex", width: `${barW}%`, background: color }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 16 }}>
                  <span style={{ display: "flex", color }}>
                    {row.differential > 0 ? "+" : ""}
                    {row.differential} diff
                  </span>
                  <span style={{ display: "flex", color: "#5c4a3d" }}>
                    luck {row.luck > 0 ? "+" : ""}
                    {row.luck}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", marginTop: 16, fontSize: 18, color: "#8a7565" }}>
          {isDownload ? "razzle.lol/league · Bureau" : "razzle.lol"}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
