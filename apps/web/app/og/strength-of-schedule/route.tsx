import { ImageResponse } from "next/og";
import { AGENT_BY_ID } from "@razzle/agents";

export const runtime = "edge";

type SchedulePayload = {
  your_rank?: number | null;
  your_ppg?: number | null;
  opponent_avg_ppg?: number | null;
  verdict?: string;
  error?: string;
};

const DEMO: Required<Pick<SchedulePayload, "your_rank" | "your_ppg" | "opponent_avg_ppg" | "verdict">> = {
  your_rank: 3,
  your_ppg: 118.9,
  opponent_avg_ppg: 112.1,
  verdict: "Even slate — you should beat the average opponent.",
};

function paceEdge(ppg: number, opp: number): number {
  return Math.round((ppg - opp) * 10) / 10;
}

function verdictColor(ppg: number, opp: number): string {
  const edge = ppg - opp;
  if (edge >= 8) return "#2ec4b6";
  if (edge >= 0) return "#d97757";
  if (edge >= -8) return "#5b7fff";
  return "#e63946";
}

function fromQuery(url: URL): SchedulePayload | null {
  const rank = url.searchParams.get("rank");
  const ppg = url.searchParams.get("ppg");
  const opp = url.searchParams.get("opp");
  const verdict = url.searchParams.get("verdict");
  if (!rank || !ppg || !opp || !verdict) return null;
  const your_rank = Number(rank);
  const your_ppg = Number(ppg);
  const opponent_avg_ppg = Number(opp);
  if ([your_rank, your_ppg, opponent_avg_ppg].some((n) => Number.isNaN(n))) return null;
  return { your_rank, your_ppg, opponent_avg_ppg, verdict };
}

async function fetchSchedule(leagueId: string, userId: string): Promise<SchedulePayload | null> {
  const apiOrigin = process.env.NEXT_PUBLIC_API_ORIGIN || "http://127.0.0.1:8000";
  if (!leagueId || !userId) return null;

  try {
    const res = await fetch(`${apiOrigin}/api/bureau/strength-of-schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ league_id: leagueId, user_id: userId }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as SchedulePayload;
    if (data.error || data.verdict == null) return null;
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
  const fromPanel = fromQuery(url);
  const live = fromPanel ? null : await fetchSchedule(league, user);
  const isDemo = !fromPanel && !live?.verdict;
  const payload = fromPanel ?? (isDemo ? DEMO : live!);
  const yourRank = payload.your_rank ?? DEMO.your_rank;
  const yourPpg = Number(payload.your_ppg ?? DEMO.your_ppg);
  const oppPpg = Number(payload.opponent_avg_ppg ?? DEMO.opponent_avg_ppg);
  const verdict = String(payload.verdict ?? DEMO.verdict);
  const edge = paceEdge(yourPpg, oppPpg);
  const accent = verdictColor(yourPpg, oppPpg);
  const sourceLabel = fromPanel ? "from your slate" : isDemo ? "sample preview" : "live league";

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
          {`remaining slate power · ${sourceLabel}`}
        </div>

        <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
          {[
            { label: "your rank", value: `#${yourRank}`, color: "#5b7fff" },
            { label: "your PPG", value: yourPpg.toFixed(1), color: "#2d1f14" },
            { label: "avg opp PPG", value: oppPpg.toFixed(1), color: "#d97757" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flex: 1,
                flexDirection: "column",
                background: "#f7efe5",
                border: "3px solid #2d1f14",
                borderRadius: 8,
                padding: "14px 18px",
                boxShadow: "4px 4px 0 #2d1f14",
              }}
            >
              <div style={{ display: "flex", fontSize: 16, color: "#5c4a3d", textTransform: "uppercase" }}>
                {stat.label}
              </div>
              <div
                style={{
                  display: "flex",
                  fontFamily: "Luckiest Guy",
                  fontSize: 44,
                  color: stat.color,
                  marginTop: 4,
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
            flexDirection: "column",
            flex: 1,
            background: "#f7efe5",
            border: "3px solid #2d1f14",
            borderRadius: 8,
            padding: "20px 24px",
            boxShadow: "4px 4px 0 #2d1f14",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", fontSize: 18, color: "#5c4a3d", textTransform: "uppercase" }}>
            pace edge vs field
          </div>
          <div style={{ display: "flex", fontFamily: "Luckiest Guy", fontSize: 40, color: accent }}>
            {`${edge >= 0 ? "+" : ""}${edge} PPG vs average opponent`}
          </div>
          <div style={{ display: "flex", fontSize: 18, color: "#5c4a3d", textTransform: "uppercase", marginTop: 8 }}>
            Octo read
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Caveat",
              fontSize: 34,
              color: accent,
              lineHeight: 1.2,
            }}
          >
            {verdict}
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
