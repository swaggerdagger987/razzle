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

const DEMO: Required<Pick<SosData, "your_rank" | "your_ppg" | "opponent_avg_ppg" | "verdict">> = {
  your_rank: 3,
  your_ppg: 118.4,
  opponent_avg_ppg: 114.2,
  verdict: "Even slate — you should beat the average opponent.",
};

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
    const data = (await res.json()) as SosData;
    if (data.error || data.your_ppg == null) return null;
    return data;
  } catch {
    return null;
  }
}

function verdictColor(verdict: string): string {
  const v = verdict.toLowerCase();
  if (v.includes("easy")) return "#2ec4b6";
  if (v.includes("brutal")) return "#e63946";
  return "#d97757";
}

function barPct(value: number, max: number): string {
  const pct = max > 0 ? Math.min(100, Math.max(14, (value / max) * 100)) : 50;
  return `${pct}%`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const isDownload = url.searchParams.get("download") === "1";
  const league = url.searchParams.get("league") ?? "";
  const user = url.searchParams.get("user") ?? "";

  const octo = AGENT_BY_ID.octo;
  const live = await fetchSos(req, league, user);
  const isDemo = !live?.your_ppg;
  const rank = isDemo ? DEMO.your_rank : live!.your_rank ?? DEMO.your_rank;
  const yourPpg = isDemo ? DEMO.your_ppg : live!.your_ppg!;
  const oppPpg = isDemo ? DEMO.opponent_avg_ppg : live!.opponent_avg_ppg ?? DEMO.opponent_avg_ppg;
  const verdict = isDemo ? DEMO.verdict : live!.verdict ?? DEMO.verdict;
  const diff = Math.round((yourPpg - oppPpg) * 10) / 10;
  const vColor = verdictColor(verdict);
  const maxPpg = Math.max(yourPpg, oppPpg, 1);

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
          {`your roster vs league scoring power · rank #${rank}${isDemo ? " · sample preview" : ""}`}
        </div>

        <div
          style={{
            display: "flex",
            fontFamily: "Caveat",
            fontSize: 32,
            color: vColor,
            marginBottom: 16,
            lineHeight: 1.2,
          }}
        >
          {verdict.length > 72 ? `${verdict.slice(0, 70)}…` : verdict}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            flex: 1,
            background: "#f7efe5",
            border: "3px solid #2d1f14",
            borderRadius: 8,
            padding: "22px 24px",
            boxShadow: "4px 4px 0 #2d1f14",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18 }}>
              <span style={{ display: "flex" }}>Your PPG</span>
              <span style={{ display: "flex", fontWeight: 700 }}>{yourPpg}</span>
            </div>
            <div
              style={{
                display: "flex",
                height: 22,
                background: "#e5d6c4",
                borderRadius: 4,
                overflow: "hidden",
                border: "2px solid #2d1f14",
              }}
            >
              <div style={{ display: "flex", width: barPct(yourPpg, maxPpg), background: "#5b7fff" }} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18 }}>
              <span style={{ display: "flex" }}>Avg opponent PPG</span>
              <span style={{ display: "flex", fontWeight: 700 }}>{oppPpg}</span>
            </div>
            <div
              style={{
                display: "flex",
                height: 22,
                background: "#e5d6c4",
                borderRadius: 4,
                overflow: "hidden",
                border: "2px solid #2d1f14",
              }}
            >
              <div style={{ display: "flex", width: barPct(oppPpg, maxPpg), background: "#d97757" }} />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 8,
              fontSize: 22,
              fontWeight: 700,
              color: diff >= 0 ? "#2ec4b6" : "#e63946",
            }}
          >
            {`slate differential: ${diff > 0 ? "+" : ""}${diff} PPG`}
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
