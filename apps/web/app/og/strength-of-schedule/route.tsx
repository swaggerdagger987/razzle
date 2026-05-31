import { ImageResponse } from "next/og";
import { AGENT_BY_ID } from "@razzle/agents";
import { decodeBureauSosOgSnapshot } from "@/lib/bureau-sos-og-snapshot";

export const runtime = "edge";

type SosData = {
  verdict?: string;
  your_ppg?: number;
  opponent_avg_ppg?: number;
  your_rank?: number | null;
  league_id?: string;
};

const DEMO_SOS: Required<Pick<SosData, "verdict" | "your_ppg" | "opponent_avg_ppg" | "your_rank">> = {
  verdict: "Brutal playoff slate ahead",
  your_ppg: 118.4,
  opponent_avg_ppg: 124.2,
  your_rank: 4,
};

function barWidth(value: number, max: number): string {
  if (max <= 0) return "0%";
  return `${Math.min(100, Math.round((value / max) * 100))}%`;
}

function verdictColor(verdict: string): string {
  const v = verdict.toLowerCase();
  if (v.includes("brutal")) return "#e63946";
  if (v.includes("easy")) return "#2ec4b6";
  if (v.includes("tough")) return "#d97757";
  return "#d97757";
}

function resolveApiOrigin(req: Request): string {
  return new URL(req.url).origin;
}

async function fetchSos(req: Request, league: string, user: string): Promise<SosData | null> {
  if (!league || !user) return null;
  const apiOrigin = resolveApiOrigin(req);
  try {
    const res = await fetch(`${apiOrigin}/api/bureau/strength-of-schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ league_id: league, user_id: user }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as SosData & { error?: string };
    if (data.error || !data.verdict) return null;
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
  const snapshotParam = url.searchParams.get("snapshot") ?? "";

  const octo = AGENT_BY_ID.octo;
  const fromSnapshot = snapshotParam ? decodeBureauSosOgSnapshot(snapshotParam) : null;
  const live = fromSnapshot ? null : await fetchSos(req, league, user);
  const isDemo = !fromSnapshot && !live?.verdict;
  const data = fromSnapshot ?? live ?? DEMO_SOS;

  const verdict = String(data.verdict ?? DEMO_SOS.verdict);
  const yourPpg = Number(data.your_ppg ?? DEMO_SOS.your_ppg);
  const oppAvg = Number(data.opponent_avg_ppg ?? DEMO_SOS.opponent_avg_ppg);
  const yourRank = data.your_rank != null ? Number(data.your_rank) : DEMO_SOS.your_rank;
  const delta = Math.round((yourPpg - oppAvg) * 10) / 10;
  const maxBar = Math.max(yourPpg, oppAvg, 1);
  const tone = verdictColor(verdict);
  const leagueLabel =
    String("league_id" in data && data.league_id ? data.league_id : league) || "sample";

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

        <div style={{ display: "flex", fontFamily: "Luckiest Guy", fontSize: 52, lineHeight: 1.1, marginBottom: 4 }}>
          Strength of Schedule
        </div>
        <div style={{ display: "flex", fontSize: 20, color: "#5c4a3d", marginBottom: 16 }}>
          {`rest-of-season matchup power · league ${leagueLabel}${isDemo ? " · sample preview" : ""}`}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            background: "#f7efe5",
            border: "4px solid #2d1f14",
            borderRadius: 8,
            padding: "20px 24px",
            marginBottom: 20,
            boxShadow: "4px 4px 0 #2d1f14",
          }}
        >
          <div style={{ display: "flex", fontSize: 16, color: "#5c4a3d", textTransform: "uppercase" }}>
            slate verdict
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Luckiest Guy",
              fontSize: 40,
              color: tone,
              marginTop: 8,
            }}
          >
            {verdict}
          </div>
          <div style={{ display: "flex", fontSize: 18, color: "#5c4a3d", marginTop: 8 }}>
            {`${delta >= 0 ? "+" : ""}${delta} PPG vs league-average opponent`}
            {yourRank != null ? ` · power rank #${yourRank}` : ""}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, marginBottom: 6 }}>
              <span>Your scoring (PPG)</span>
              <span style={{ display: "flex", fontWeight: 700 }}>{yourPpg}</span>
            </div>
            <div
              style={{
                display: "flex",
                height: 20,
                background: "#e5d6c4",
                border: "3px solid #2d1f14",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <div style={{ display: "flex", width: barWidth(yourPpg, maxBar), background: "#d97757" }} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, marginBottom: 6 }}>
              <span>Avg opponent PPG (league)</span>
              <span style={{ display: "flex", fontWeight: 700 }}>{oppAvg}</span>
            </div>
            <div
              style={{
                display: "flex",
                height: 20,
                background: "#e5d6c4",
                border: "3px solid #2d1f14",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <div style={{ display: "flex", width: barWidth(oppAvg, maxBar), background: "#5b7fff" }} />
            </div>
          </div>
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
            razzle.lol/league{league ? `/${league}` : ""}/strength-of-schedule
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
