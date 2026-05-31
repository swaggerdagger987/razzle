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
  luck: number;
};

type PowerData = {
  rows?: PowerRow[];
  error?: string;
};

const DEMO_ROWS: PowerRow[] = [
  { rank: 1, roster_id: 1, team: "Dynasty Dukes", record: "9-4", ppg: 118.2, opp_ppg: 102.1, differential: 16.1, luck: 1.2 },
  { rank: 2, roster_id: 2, team: "Win-Now LLC", record: "8-5", ppg: 114.5, opp_ppg: 108.3, differential: 6.2, luck: -0.4 },
  { rank: 3, roster_id: 3, team: "Rebuild FC", record: "5-8", ppg: 101.4, opp_ppg: 112.8, differential: -11.4, luck: 0.8 },
  { rank: 4, roster_id: 4, team: "Comfort Crew", record: "7-6", ppg: 106.2, opp_ppg: 105.9, differential: 0.3, luck: -1.1 },
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

function diffColor(diff: number): string {
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
          <div style={{ display: "flex", fontSize: 48 }}>🐯</div>
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
          {`beyond W-L · points differential + luck${isDemo ? " · sample preview" : ""}`}
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
            {`#1 ${leader.team} (${leader.record}) — ${leader.differential > 0 ? "+" : ""}${leader.differential} diff`}
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
            const barWidth = `${Math.min(100, Math.max(12, 50 + row.differential * 3))}%`;
            return (
              <div key={row.roster_id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", width: 150, flexDirection: "column" }}>
                  <div style={{ display: "flex", fontSize: 18, fontWeight: 700 }}>
                    {`#${row.rank} ${teamLabel(row.team)}`}
                  </div>
                  <div style={{ display: "flex", fontSize: 14, color: "#8a7565" }}>
                    {`${row.record} · ${row.ppg} PPG`}
                  </div>
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
                  <div style={{ display: "flex", width: barWidth, background: color }} />
                </div>
                <div style={{ display: "flex", width: 52, fontSize: 18, fontWeight: 700, color }}>
                  {row.differential > 0 ? "+" : ""}
                  {row.differential}
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: 14,
                    color,
                    border: `2px solid ${color}`,
                    padding: "2px 8px",
                    borderRadius: 6,
                  }}
                >
                  {`luck ${row.luck > 0 ? "+" : ""}${row.luck}`}
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
