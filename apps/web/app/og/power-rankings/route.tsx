import { ImageResponse } from "next/og";
import { AGENT_BY_ID } from "@razzle/agents";
import { toLeague } from "@razzle/hallway";
import { decodeBureauPowerRankingsOgSnapshot } from "@/lib/bureau-power-rankings-og-snapshot";

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
  league_id?: string;
  rows?: PowerRow[];
  error?: string;
};

const DEMO_ROWS: PowerRow[] = [
  { rank: 1, roster_id: 1, team: "Dynasty Dukes", record: "9-4", ppg: 124.2, opp_ppg: 108.5, differential: 15.7, expected_wins: 8.2, luck: 0.8 },
  { rank: 2, roster_id: 2, team: "Win-Now LLC", record: "8-5", ppg: 118.9, opp_ppg: 112.1, differential: 6.8, expected_wins: 7.4, luck: 0.6 },
  { rank: 3, roster_id: 3, team: "Rebuild FC", record: "5-8", ppg: 111.4, opp_ppg: 119.8, differential: -8.4, expected_wins: 5.1, luck: -0.1 },
  { rank: 4, roster_id: 4, team: "Comfort Crew", record: "7-6", ppg: 115.0, opp_ppg: 114.2, differential: 0.8, expected_wins: 6.9, luck: 0.1 },
  { rank: 5, roster_id: 5, team: "Late Surge", record: "6-7", ppg: 109.3, opp_ppg: 116.7, differential: -7.4, expected_wins: 5.8, luck: 0.2 },
];

const DEMO_LEADER = DEMO_ROWS[0];

function diffColor(diff: number): string {
  if (diff >= 8) return "#2ec4b6";
  if (diff >= 0) return "#d97757";
  return "#e63946";
}

/** Edge OG must hit same-origin `/api/*` so Next rewrites reach FastAPI (dev/preview/CI). */
function resolveApiOrigin(req: Request): string {
  return new URL(req.url).origin;
}

async function fetchPowerRankings(req: Request, leagueId: string): Promise<PowerData | null> {
  if (!leagueId) return null;
  const apiOrigin = resolveApiOrigin(req);

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

export async function GET(req: Request) {
  const url = new URL(req.url);
  const isDownload = url.searchParams.get("download") === "1";
  const league = url.searchParams.get("league") ?? "";
  const snapshotParam = url.searchParams.get("snapshot") ?? "";
  const snapshot = snapshotParam ? decodeBureauPowerRankingsOgSnapshot(snapshotParam) : null;

  const octo = AGENT_BY_ID.octo;
  const fromSnapshot = snapshot?.rows?.length ? snapshot.rows : null;
  const live = fromSnapshot ? null : await fetchPowerRankings(req, league);
  const isLive = Boolean(live?.rows?.length);
  const isDemo = !fromSnapshot?.length && !isLive;
  const rows = (fromSnapshot ?? (isDemo ? DEMO_ROWS : live!.rows!)).slice(0, 5);
  const leader = rows[0] ?? DEMO_LEADER;
  const fromPanel = Boolean(fromSnapshot?.length);
  const leagueDeepLink = league ? toLeague(league, "power-rankings") : "/league/power-rankings";

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
          {`points differential · pythagorean luck${
            fromPanel ? " · from your board" : isLive ? " · live league data" : " · sample preview"
          }`}
        </div>

        {isLive ? (
          <div
            style={{
              fontFamily: "Caveat",
              fontSize: 32,
              color: "#f7efe5",
              background: "#2ec4b6",
              padding: "6px 18px",
              alignSelf: "flex-start",
              border: "3px solid #2d1f14",
              borderRadius: 10,
              boxShadow: "4px 4px 0 #2d1f14",
              transform: "rotate(-2deg)",
              marginBottom: 12,
              fontWeight: 700,
              display: "flex",
            }}
          >
            LIVE · Sleeper power rankings
          </div>
        ) : null}

        {isDemo && !fromPanel ? (
          <div
            style={{
              fontFamily: "Caveat",
              fontSize: 32,
              color: "#f7efe5",
              background: "#d97757",
              padding: "6px 18px",
              alignSelf: "flex-start",
              border: "3px solid #2d1f14",
              borderRadius: 10,
              boxShadow: "4px 4px 0 #2d1f14",
              transform: "rotate(1.5deg)",
              marginBottom: 12,
              fontWeight: 700,
              display: "flex",
            }}
          >
            SAMPLE · demo ranking rows
          </div>
        ) : null}

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
            {`#${leader.rank} ${leader.team} — ${leader.differential > 0 ? "+" : ""}${leader.differential} diff · luck ${leader.luck > 0 ? "+" : ""}${leader.luck}`}
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
            const barWidth = Math.min(100, Math.max(12, 50 + row.differential * 3));
            return (
              <div key={row.roster_id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", width: 150, flexDirection: "column" }}>
                  <div style={{ display: "flex", fontSize: 18, fontWeight: 700 }}>
                    #{row.rank} {teamLabel(row.team)}
                  </div>
                  <div style={{ display: "flex", fontSize: 14, color: "#8a7565" }}>
                    {row.record} · {row.ppg} PPG
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
                  <div style={{ display: "flex", width: `${barWidth}%`, background: color }} />
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

        {/* Always-on watermark band — matches Pressure Map + Self-Scout OG (T6 screenshot gravity) */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 16,
            padding: "10px 18px",
            background: "#d97757",
            color: "#f7efe5",
            border: "3px solid #2d1f14",
            borderRadius: 8,
            boxShadow: "4px 4px 0 #2d1f14",
            fontSize: 20,
          }}
        >
          <div style={{ display: "flex", fontWeight: 700 }}>{`razzle.lol${leagueDeepLink}`}</div>
          <div style={{ display: "flex", fontFamily: "Caveat", fontSize: 30 }}>
            {`made with 🐯 razzle.lol${isDownload ? " · export" : ""}`}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
