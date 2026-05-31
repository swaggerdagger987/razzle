import { ImageResponse } from "next/og";
import { AGENT_BY_ID } from "@razzle/agents";

export const runtime = "edge";

type PowerRow = {
  rank: number;
  roster_id: number;
  team: string;
  record: string;
  ppg: number;
  opp_ppg: number;
  differential: number;
  expected_wins: number;
  luck: number;
};

type PowerData = {
  rows?: PowerRow[];
  error?: string;
};

const DEMO_ROWS: PowerRow[] = [
  { rank: 1, roster_id: 1, team: "Dynasty Dukes", record: "9-4", ppg: 124.2, opp_ppg: 108.5, differential: 15.7, expected_wins: 8.2, luck: 0.8 },
  { rank: 2, roster_id: 2, team: "Win-Now LLC", record: "8-5", ppg: 118.4, opp_ppg: 112.1, differential: 6.3, expected_wins: 7.1, luck: 0.9 },
  { rank: 3, roster_id: 3, team: "Rebuild FC", record: "5-8", ppg: 109.8, opp_ppg: 115.2, differential: -5.4, expected_wins: 6.4, luck: -1.4 },
  { rank: 4, roster_id: 4, team: "Comfort Crew", record: "7-6", ppg: 111.0, opp_ppg: 110.8, differential: 0.2, expected_wins: 6.9, luck: 0.1 },
  { rank: 5, roster_id: 5, team: "Tank Town", record: "3-10", ppg: 98.6, opp_ppg: 121.4, differential: -22.8, expected_wins: 3.8, luck: -0.8 },
];

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

function teamLabel(name: string): string {
  return name.length > 16 ? `${name.slice(0, 14)}…` : name;
}

function diffColor(diff: number): string {
  if (diff >= 8) return "#2ec4b6";
  if (diff >= 0) return "#d97757";
  return "#e63946";
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const isDownload = url.searchParams.get("download") === "1";
  const league = url.searchParams.get("league") ?? "";

  const octo = AGENT_BY_ID.octo;
  const live = await fetchPowerRankings(league);
  const isDemo = !live?.rows?.length;
  const rows = (isDemo ? DEMO_ROWS : live!.rows!).slice(0, 5);
  const leader = rows[0];

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
            <span style={{ display: "flex", fontSize: 24 }}>{octo.emoji}</span>
            <span style={{ display: "flex" }}>{octo.name}</span>
          </div>
        </div>

        <div style={{ display: "flex", fontFamily: "Luckiest Guy", fontSize: 56, lineHeight: 1.1, marginBottom: 4 }}>
          Power Rankings
        </div>
        <div style={{ display: "flex", fontSize: 20, color: "#5c4a3d", marginBottom: 14 }}>
          {`beyond W-L · differential + luck index${isDemo ? " · sample preview" : ""}`}
        </div>

        {leader ? (
          <div
            style={{
              display: "flex",
              fontFamily: "Caveat",
              fontSize: 30,
              color: "#d97757",
              marginBottom: 12,
            }}
          >
            {`#1 ${leader.team} — ${leader.differential > 0 ? "+" : ""}${leader.differential} PPG edge`}
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            flex: 1,
            background: "#f7efe5",
            border: "3px solid #2d1f14",
            borderRadius: 8,
            padding: "14px 18px",
            boxShadow: "4px 4px 0 #2d1f14",
          }}
        >
          {rows.map((row) => {
            const color = diffColor(row.differential);
            const barWidth = Math.min(100, Math.max(12, 50 + row.differential * 2));
            return (
              <div key={row.roster_id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", width: 36, fontSize: 22, fontWeight: 700, color: "#d97757" }}>
                  #{row.rank}
                </div>
                <div style={{ display: "flex", width: 130, flexDirection: "column" }}>
                  <div style={{ display: "flex", fontSize: 18, fontWeight: 700 }}>{teamLabel(row.team)}</div>
                  <div style={{ display: "flex", fontSize: 14, color: "#8a7565" }}>{row.record}</div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flex: 1,
                    height: 18,
                    background: "#e5d6c4",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div style={{ display: "flex", width: `${barWidth}%`, background: color }} />
                </div>
                <div style={{ display: "flex", width: 56, fontSize: 16, fontWeight: 700, color }}>
                  {row.differential > 0 ? "+" : ""}
                  {row.differential}
                </div>
                <div style={{ display: "flex", width: 52, fontSize: 14, color: "#5c4a3d" }}>
                  {row.luck > 0 ? "+" : ""}
                  {row.luck} luck
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
          <div style={{ display: "flex" }}>{`razzle.lol/league${league ? `/${league}` : ""}/power-rankings`}</div>
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
