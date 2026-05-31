import { ImageResponse } from "next/og";
import { AGENT_BY_ID } from "@razzle/agents";

export const runtime = "edge";

type PowerRow = {
  rank: number;
  team: string;
  record: string;
  ppg: number;
  differential: number;
  luck: number;
};

const DEMO_ROWS: PowerRow[] = [
  { rank: 1, team: "Dynasty Dukes", record: "9-4", ppg: 124.2, differential: 15.7, luck: 0.8 },
  { rank: 2, team: "Rebuild FC", record: "8-5", ppg: 118.6, differential: 9.2, luck: -0.4 },
  { rank: 3, team: "Your Squad", record: "7-6", ppg: 112.1, differential: 2.4, luck: 1.1 },
];

async function fetchPowerRankings(leagueId: string): Promise<PowerRow[] | null> {
  const apiOrigin = process.env.NEXT_PUBLIC_API_ORIGIN || "http://127.0.0.1:8000";
  if (!leagueId) return null;

  try {
    const res = await fetch(`${apiOrigin}/api/bureau/power-rankings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ league_id: leagueId }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      rows?: Array<{
        rank: number;
        team: string;
        record: string;
        ppg: number;
        differential: number;
        luck: number;
      }>;
      error?: string;
    };
    if (data.error || !data.rows?.length) return null;
    return data.rows.slice(0, 3).map((r) => ({
      rank: r.rank,
      team: r.team,
      record: r.record,
      ppg: r.ppg,
      differential: r.differential,
      luck: r.luck,
    }));
  } catch {
    return null;
  }
}

function diffColor(diff: number): string {
  if (diff >= 8) return "#2ec4b6";
  if (diff >= 0) return "#d97757";
  return "#ef4444";
}

function barWidth(diff: number): string {
  return `${Math.min(100, Math.max(12, 50 + diff * 3))}%`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const isDownload = url.searchParams.get("download") === "1";
  const league = url.searchParams.get("league") ?? "";

  const octo = AGENT_BY_ID.octo;
  const live = await fetchPowerRankings(league);
  const isDemo = !live?.length;
  const rows = isDemo ? DEMO_ROWS : live;

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

        <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
          {rows.map((row) => {
            const color = diffColor(row.differential);
            return (
              <div
                key={`${row.rank}-${row.team}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  background: "#f7efe5",
                  border: "3px solid #2d1f14",
                  borderRadius: 8,
                  padding: "14px 18px",
                  boxShadow: "4px 4px 0 #2d1f14",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", fontFamily: "Luckiest Guy", fontSize: 28 }}>
                    #{row.rank} {row.team}
                  </div>
                  <div style={{ display: "flex", fontSize: 16, color: "#8a7565" }}>{row.record}</div>
                </div>
                <div style={{ display: "flex", gap: 20, marginBottom: 8 }}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", fontSize: 32, color: "#d97757", fontWeight: 700 }}>
                      {row.ppg}
                    </div>
                    <div style={{ display: "flex", fontSize: 14, color: "#5c4a3d" }}>PPG</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", fontSize: 32, color: color, fontWeight: 700 }}>
                      {row.differential > 0 ? "+" : ""}
                      {row.differential}
                    </div>
                    <div style={{ display: "flex", fontSize: 14, color: "#5c4a3d" }}>diff</div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flex: 1,
                      alignItems: "flex-end",
                      justifyContent: "flex-end",
                      fontSize: 16,
                      color: "#5c4a3d",
                    }}
                  >
                    {`luck ${row.luck > 0 ? "+" : ""}${row.luck}`}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    height: 14,
                    background: "#e5d6c4",
                    border: "2px solid #2d1f14",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div style={{ display: "flex", width: barWidth(row.differential), background: color }} />
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
          <div style={{ display: "flex" }}>
            razzle.lol/league{league ? `/${league}` : ""}/power-rankings
          </div>
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
