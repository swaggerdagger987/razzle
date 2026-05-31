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
  your_ppg: 118.4,
  opponent_avg_ppg: 112.1,
  verdict: "Even slate — you should beat the average opponent.",
};

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
  const data = live ?? DEMO;
  const rank = data.your_rank != null ? `#${data.your_rank}` : "—";
  const yourPpg = data.your_ppg != null ? data.your_ppg.toFixed(1) : "—";
  const oppPpg = data.opponent_avg_ppg != null ? data.opponent_avg_ppg.toFixed(1) : "—";
  const verdict = String(data.verdict ?? "Schedule read from live power rankings.");

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

        <div
          style={{
            display: "flex",
            fontFamily: "Luckiest Guy",
            fontSize: 56,
            lineHeight: 1.1,
            marginBottom: 4,
          }}
        >
          Strength of Schedule
        </div>
        <div style={{ display: "flex", fontSize: 20, color: "#5c4a3d", marginBottom: 24 }}>
          {`remaining slate from power rankings${isDemo ? " · sample preview" : ""}`}
        </div>

        <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
          {[
            { label: "your rank", value: rank, color: "#5b7fff" },
            { label: "your PPG", value: yourPpg, color: "#2d1f14" },
            { label: "avg opp PPG", value: oppPpg, color: "#d97757" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                background: "#f7efe5",
                border: "3px solid #2d1f14",
                borderRadius: 8,
                padding: "16px 20px",
                boxShadow: "4px 4px 0 #2d1f14",
              }}
            >
              <div style={{ display: "flex", fontSize: 14, color: "#5c4a3d", marginBottom: 8 }}>
                {stat.label}
              </div>
              <div
                style={{
                  display: "flex",
                  fontFamily: "Luckiest Guy",
                  fontSize: 44,
                  color: stat.color,
                }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            background: "#f7efe5",
            border: "3px solid #2d1f14",
            borderRadius: 8,
            padding: "20px 24px",
            boxShadow: "4px 4px 0 #2d1f14",
            fontFamily: "Caveat",
            fontSize: 32,
            lineHeight: 1.3,
          }}
        >
          {verdict}
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
