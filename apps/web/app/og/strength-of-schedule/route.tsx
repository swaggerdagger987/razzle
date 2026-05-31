import { ImageResponse } from "next/og";
import { AGENT_BY_ID } from "@razzle/agents";

export const runtime = "edge";

type ScheduleData = {
  league_id?: string;
  user_id?: string;
  your_rank?: number;
  your_ppg?: number;
  opponent_avg_ppg?: number;
  verdict?: string;
  error?: string;
};

const DEMO: ScheduleData = {
  league_id: "demo",
  user_id: "demo",
  your_rank: 3,
  your_ppg: 118.4,
  opponent_avg_ppg: 109.2,
  verdict: "Even slate — you should beat the average opponent.",
};

async function fetchSchedule(leagueId: string, userId: string): Promise<ScheduleData | null> {
  const apiOrigin = process.env.NEXT_PUBLIC_API_ORIGIN || "http://127.0.0.1:8000";
  if (!leagueId || !userId) return null;

  try {
    const res = await fetch(`${apiOrigin}/api/bureau/strength-of-schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ league_id: leagueId, user_id: userId }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as ScheduleData;
    if (data.error || data.your_rank == null) return null;
    return data;
  } catch {
    return null;
  }
}

function statBlock(label: string, value: string, accent?: string) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        flex: 1,
        background: "#f7efe5",
        border: "3px solid #2d1f14",
        borderRadius: 8,
        padding: "16px 18px",
        boxShadow: "4px 4px 0 #2d1f14",
      }}
    >
      <div style={{ display: "flex", fontSize: 14, color: "#8a7565", textTransform: "uppercase" }}>
        {label}
      </div>
      <div
        style={{
          display: "flex",
          fontFamily: "Luckiest Guy",
          fontSize: 44,
          color: accent ?? "#2d1f14",
        }}
      >
        {value}
      </div>
    </div>
  );
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const isDownload = url.searchParams.get("download") === "1";
  const league = url.searchParams.get("league") ?? "";
  const user = url.searchParams.get("user") ?? "";

  const octo = AGENT_BY_ID.octo;
  const live = await fetchSchedule(league, user);
  const isDemo = !live;
  const data = live ?? DEMO;
  const yourRank = data.your_rank ?? null;
  const yourPpg = data.your_ppg ?? null;
  const oppAvg = data.opponent_avg_ppg ?? null;
  const verdict = data.verdict ?? "";
  const delta =
    yourPpg != null && oppAvg != null ? Math.round((yourPpg - oppAvg) * 10) / 10 : null;

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
        <div style={{ display: "flex", fontSize: 20, color: "#5c4a3d", marginBottom: 16 }}>
          {`power-ranked remaining slate${isDemo ? " · sample preview" : ""}`}
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          {statBlock("your rank", yourRank != null ? `#${yourRank}` : "—", "#5b7fff")}
          {statBlock("your PPG", yourPpg != null ? yourPpg.toFixed(1) : "—")}
          {statBlock("avg opp PPG", oppAvg != null ? oppAvg.toFixed(1) : "—", "#d97757")}
        </div>

        {delta != null ? (
          <div
            style={{
              display: "flex",
              fontFamily: "Luckiest Guy",
              fontSize: 32,
              marginBottom: 12,
              color: delta >= 0 ? "#2ec4b6" : "#d97757",
            }}
          >
            {`${delta >= 0 ? "+" : ""}${delta} PPG vs average opponent`}
          </div>
        ) : null}

        {verdict ? (
          <div
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "column",
              justifyContent: "center",
              background: "#f7efe5",
              border: "3px solid #2d1f14",
              borderRadius: 8,
              padding: "20px 24px",
              boxShadow: "4px 4px 0 #2d1f14",
            }}
          >
            <div style={{ display: "flex", fontSize: 14, color: "#8a7565", marginBottom: 8 }}>
              OCTO READ
            </div>
            <div style={{ display: "flex", fontFamily: "Caveat", fontSize: 36, color: "#2d1f14", lineHeight: 1.2 }}>
              {verdict}
            </div>
          </div>
        ) : null}

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
          <div style={{ display: "flex" }}>{`razzle.lol/league${league ? `/${league}` : ""}/strength-of-schedule`}</div>
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
