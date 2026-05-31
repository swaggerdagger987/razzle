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

const DEMO = {
  your_rank: 2,
  your_ppg: 118.9,
  opponent_avg_ppg: 112.1,
  verdict: "Even slate — you should beat the average opponent.",
  tone_label: "even slate",
  tone_color: "#d97757",
  delta: 6.8,
};

function scheduleTone(yourPpg: number, oppPpg: number): { label: string; color: string } {
  const delta = yourPpg - oppPpg;
  if (delta >= 8) return { label: "easy road", color: "#2ec4b6" };
  if (delta >= 0) return { label: "even slate", color: "#d97757" };
  if (delta >= -8) return { label: "tough slate", color: "#e63946" };
  return { label: "brutal slate", color: "#e63946" };
}

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
    if (data.error || data.your_ppg == null) return null;
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
  const live = await fetchSchedule(league, user);
  const isDemo = !live?.your_ppg;
  const yourPpg = isDemo ? DEMO.your_ppg : (live!.your_ppg ?? 0);
  const oppPpg = isDemo ? DEMO.opponent_avg_ppg : (live!.opponent_avg_ppg ?? 0);
  const yourRank = isDemo ? DEMO.your_rank : live!.your_rank;
  const verdict = isDemo ? DEMO.verdict : (live!.verdict ?? "Schedule strength from league power model.");
  const tone = isDemo
    ? { label: DEMO.tone_label, color: DEMO.tone_color }
    : scheduleTone(yourPpg, oppPpg);
  const delta = Math.round((yourPpg - oppPpg) * 10) / 10;

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
        <div style={{ display: "flex", fontSize: 20, color: "#5c4a3d", marginBottom: 10 }}>
          {`${yourRank != null ? `#${yourRank} league power` : "league power"} · rest-of-season opponent PPG${isDemo ? " · sample preview" : ""}`}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 16,
              fontWeight: 700,
              textTransform: "uppercase",
              color: "#f7efe5",
              background: tone.color,
              padding: "6px 14px",
              border: "3px solid #2d1f14",
              borderRadius: 6,
              boxShadow: "3px 3px 0 #2d1f14",
            }}
          >
            {tone.label}
          </div>
          <div style={{ display: "flex", fontFamily: "Caveat", fontSize: 26, color: "#d97757" }}>
            {`${delta > 0 ? "+" : ""}${delta} PPG edge vs field`}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            gap: 16,
            background: "#f7efe5",
            border: "3px solid #2d1f14",
            borderRadius: 8,
            padding: "20px 24px",
            boxShadow: "4px 4px 0 #2d1f14",
          }}
        >
          <div style={{ display: "flex", fontFamily: "Caveat", fontSize: 28, color: "#2d1f14", lineHeight: 1.3 }}>
            {verdict}
          </div>

          <div style={{ display: "flex", gap: 14, flex: 1 }}>
            {[
              { label: "your PPG", value: String(yourPpg), color: "#2d1f14" },
              { label: "avg opp PPG", value: String(oppPpg), color: "#5c4a3d" },
              { label: "edge vs field", value: `${delta > 0 ? "+" : ""}${delta}`, color: tone.color },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  display: "flex",
                  flex: 1,
                  flexDirection: "column",
                  gap: 8,
                  background: "#ede0cf",
                  border: "3px solid #2d1f14",
                  borderRadius: 8,
                  padding: "16px 18px",
                  boxShadow: "3px 3px 0 #2d1f14",
                }}
              >
                <div style={{ display: "flex", fontSize: 14, textTransform: "uppercase", color: "#8a7565" }}>
                  {stat.label}
                </div>
                <div
                  style={{
                    display: "flex",
                    fontFamily: "Luckiest Guy",
                    fontSize: 52,
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
              height: 18,
              background: "#e5d6c4",
              borderRadius: 4,
              overflow: "hidden",
              border: "2px solid #2d1f14",
            }}
          >
            <div
              style={{
                display: "flex",
                width: `${Math.min(100, Math.max(15, 50 + delta * 4))}%`,
                background: tone.color,
              }}
            />
          </div>
        </div>

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
