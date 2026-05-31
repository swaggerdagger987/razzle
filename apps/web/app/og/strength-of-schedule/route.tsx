import { ImageResponse } from "next/og";
import { AGENT_BY_ID } from "@razzle/agents";

export const runtime = "edge";

type SosData = {
  your_rank?: number;
  your_ppg?: number;
  opponent_avg_ppg?: number;
  verdict?: string;
  error?: string;
};

const DEMO: SosData = {
  your_rank: 3,
  your_ppg: 118.5,
  opponent_avg_ppg: 112.2,
  verdict: "Tough but winnable — you'll need to play above average.",
};

function barColor(delta: number): string {
  if (delta >= 6) return "#2ec4b6";
  if (delta >= 0) return "#d97757";
  return "#e63946";
}

async function fetchSos(leagueId: string, userId: string): Promise<SosData | null> {
  const apiOrigin = process.env.NEXT_PUBLIC_API_ORIGIN || "http://127.0.0.1:8000";
  if (!leagueId || !userId) return null;

  try {
    const res = await fetch(`${apiOrigin}/api/bureau/strength-of-schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ league_id: leagueId, user_id: userId }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as SosData;
    if (data.error || data.your_rank == null) return null;
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

  const octo = AGENT_BY_ID.octo;
  const live = await fetchSos(league, user);
  const isDemo = !live;
  const data = isDemo ? DEMO : live!;
  const yourPpg = Number(data.your_ppg ?? 0);
  const oppPpg = Number(data.opponent_avg_ppg ?? 0);
  const delta = Math.round((yourPpg - oppPpg) * 10) / 10;
  const color = barColor(delta);
  const yourBar = Math.min(100, Math.max(20, (yourPpg / 140) * 100));
  const oppBar = Math.min(100, Math.max(20, (oppPpg / 140) * 100));

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
          Strength of Schedule
        </div>
        <div style={{ display: "flex", fontSize: 20, color: "#5c4a3d", marginBottom: 14 }}>
          {`your #${data.your_rank} roster vs league slate${isDemo ? " · sample preview" : ""}`}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            flex: 1,
            background: "#f7efe5",
            border: "3px solid #2d1f14",
            borderRadius: 8,
            padding: "20px 24px",
            boxShadow: "4px 4px 0 #2d1f14",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", fontSize: 16, color: "#5c4a3d" }}>your PPG</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", fontSize: 32, fontWeight: 700, width: 90 }}>{yourPpg.toFixed(1)}</div>
              <div
                style={{
                  display: "flex",
                  flex: 1,
                  height: 22,
                  background: "#e5d6c4",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <div style={{ display: "flex", width: `${yourBar}%`, background: "#5b7fff" }} />
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", fontSize: 16, color: "#5c4a3d" }}>avg opponent PPG</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", fontSize: 32, fontWeight: 700, width: 90 }}>{oppPpg.toFixed(1)}</div>
              <div
                style={{
                  display: "flex",
                  flex: 1,
                  height: 22,
                  background: "#e5d6c4",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <div style={{ display: "flex", width: `${oppBar}%`, background: "#d97757" }} />
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              fontWeight: 700,
              color,
              marginTop: 8,
            }}
          >
            {`${delta > 0 ? "+" : ""}${delta} PPG vs slate`}
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Caveat",
              fontSize: 26,
              color: "#2d1f14",
              lineHeight: 1.3,
            }}
          >
            {String(data.verdict ?? "").slice(0, 120)}
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
            {`razzle.lol/league${league ? `/${league}` : ""}/strength-of-schedule`}
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
