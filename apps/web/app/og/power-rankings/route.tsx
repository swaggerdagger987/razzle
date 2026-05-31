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
  { rank: 1, team: "Dynasty Dukes", record: "9-4", ppg: 118.4, differential: 12.3, luck: 1.2 },
  { rank: 2, team: "Win-Now LLC", record: "8-5", ppg: 114.1, differential: 6.8, luck: -0.4 },
  { rank: 3, team: "Your Squad", record: "7-6", ppg: 109.2, differential: 2.1, luck: 0.8 },
  { rank: 4, team: "Rebuild FC", record: "5-8", ppg: 98.6, differential: -8.4, luck: -1.1 },
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
    const data = (await res.json()) as { rows?: PowerRow[]; error?: string };
    if (data.error || !data.rows?.length) return null;
    return data.rows.slice(0, 4);
  } catch {
    return null;
  }
}

function teamLabel(name: string): string {
  return name.length > 16 ? `${name.slice(0, 14)}…` : name;
}

function diffBarWidth(diff: number): string {
  const pct = Math.min(100, Math.max(8, 50 + diff * 4));
  return `${pct}%`;
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
            <span style={{ fontSize: 24 }}>{octo.emoji}</span>
            <span>{octo.name}</span>
          </div>
        </div>

        <div style={{ display: "flex", fontFamily: "Luckiest Guy", fontSize: 56, lineHeight: 1.1, marginBottom: 4 }}>
          Power Rankings
        </div>
        <div style={{ display: "flex", fontSize: 20, color: "#5c4a3d", marginBottom: 20 }}>
          {`points differential — not just W-L${isDemo ? " · sample preview" : ""}`}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
          {rows.map((row) => (
            <div
              key={`${row.rank}-${row.team}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
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
                  width: 44,
                  height: 44,
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "Luckiest Guy",
                  fontSize: 28,
                  background: row.rank === 1 ? "#d97757" : "#e5d6c4",
                  border: "2px solid #2d1f14",
                  borderRadius: 8,
                  color: row.rank === 1 ? "#f7efe5" : "#2d1f14",
                }}
              >
                {row.rank}
              </div>
              <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", fontFamily: "Luckiest Guy", fontSize: 26 }}>
                  {teamLabel(row.team)}
                </div>
                <div style={{ display: "flex", fontSize: 16, color: "#5c4a3d" }}>
                  {`${row.record} · ${row.ppg} ppg · luck ${row.luck >= 0 ? "+" : ""}${row.luck}`}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", width: 120 }}>
                <div
                  style={{
                    display: "flex",
                    fontSize: 28,
                    fontWeight: 700,
                    color: row.differential >= 0 ? "#2ec4b6" : "#e63946",
                  }}
                >
                  {row.differential >= 0 ? `+${row.differential}` : row.differential}
                </div>
                <div
                  style={{
                    display: "flex",
                    width: 100,
                    height: 10,
                    background: "#e5d6c4",
                    border: "2px solid #2d1f14",
                    borderRadius: 4,
                    overflow: "hidden",
                    marginTop: 4,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      width: diffBarWidth(row.differential),
                      background: row.differential >= 0 ? "#2ec4b6" : "#e63946",
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
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
