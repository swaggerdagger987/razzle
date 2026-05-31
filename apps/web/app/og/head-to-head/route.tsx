import { ImageResponse } from "next/og";
import { AGENT_BY_ID } from "@razzle/agents";
import { decodeH2hSnapshot } from "@/lib/bureau-h2h-snapshot";

export const runtime = "edge";

interface TeamSummary {
  team: string;
  record: string;
  ppg: number;
}

interface PosCompare {
  position: string;
  your_count: number;
  their_count: number;
}

interface H2HData {
  you?: TeamSummary;
  them?: TeamSummary;
  position_compare?: PosCompare[];
  trade_fit?: { you_could_offer?: string[]; you_could_target?: string[] };
}

/** Sample rivalry for OG preview when league params/API unavailable (FACTORY-DOD Gate C). */
const DEMO_H2H: Required<Pick<H2HData, "you" | "them" | "position_compare" | "trade_fit">> = {
  you: { team: "Your Squad", record: "8-5", ppg: 118.4 },
  them: { team: "Rival FC", record: "7-6", ppg: 112.1 },
  position_compare: [
    { position: "RB", your_count: 4, their_count: 2 },
    { position: "WR", your_count: 5, their_count: 6 },
    { position: "TE", your_count: 2, their_count: 1 },
  ],
  trade_fit: {
    you_could_offer: ["RB"],
    you_could_target: ["WR"],
  },
};

async function fetchH2H(params: {
  league: string;
  user: string;
  opponent: string;
}): Promise<H2HData | null> {
  const apiOrigin = process.env.NEXT_PUBLIC_API_ORIGIN || "http://127.0.0.1:8000";
  if (!params.league || !params.user) return null;

  try {
    const res = await fetch(`${apiOrigin}/api/bureau/head-to-head`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        league_id: params.league,
        user_id: params.user,
        opponent_user_id: params.opponent || null,
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as H2HData & { error?: string };
    if (data.error || !data.you || !data.them) return null;
    return data;
  } catch {
    return null;
  }
}

function teamLabel(name: string): string {
  return name.length > 18 ? `${name.slice(0, 16)}…` : name;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const isDownload = url.searchParams.get("download") === "1";
  const league = url.searchParams.get("league") ?? "";
  const user = url.searchParams.get("user") ?? "";
  const opponent = url.searchParams.get("opponent") ?? "";

  const atlas = AGENT_BY_ID.atlas;
  const snapshotParam = url.searchParams.get("snapshot") ?? "";
  const snapshot = snapshotParam ? decodeH2hSnapshot(snapshotParam) : null;
  const snapshotHasTeams = Boolean(snapshot?.you?.team && snapshot?.them?.team);

  const live = snapshotHasTeams ? null : await fetchH2H({ league, user, opponent });
  const isDemo = !snapshotHasTeams && (!live?.you || !live?.them);
  const data = snapshotHasTeams
    ? {
        you: snapshot!.you,
        them: snapshot!.them,
        position_compare: snapshot!.position_compare,
        trade_fit: snapshot!.trade_fit,
      }
    : isDemo
      ? DEMO_H2H
      : live!;

  const you = data.you;
  const them = data.them;
  const positionCompare = data.position_compare ?? [];
  const offer = (data.trade_fit?.you_could_offer ?? []).join(", ") || "—";
  const want = (data.trade_fit?.you_could_target ?? []).join(", ") || "—";
  const hasData = Boolean(you && them);

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
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
          <div style={{ fontSize: 48, display: "flex" }}>🐯</div>
          <div style={{ display: "flex", fontSize: 36, fontWeight: 700 }}>
            Razzle<span style={{ color: "#d97757" }}>.lol</span>
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
            <span style={{ fontSize: 24 }}>{atlas.emoji}</span>
            <span>{atlas.name}</span>
          </div>
        </div>

        {/* Title */}
        <div style={{ fontFamily: "Luckiest Guy", fontSize: 56, lineHeight: 1.1, marginBottom: 4 }}>
          Head-to-Head
        </div>
        <div style={{ display: "flex", fontSize: 20, color: "#5c4a3d", marginBottom: 18 }}>
          {`rivalry dossier — your roster vs one leaguemate${
            snapshotHasTeams ? " · from your league" : isDemo ? " · sample preview" : ""
          }`}
        </div>

        {hasData ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
            {/* Team matchup */}
            <div style={{ display: "flex", gap: 14 }}>
              {[
                { label: "YOU", t: you as TeamSummary, accent: "#d97757" },
                { label: "THEM", t: them as TeamSummary, accent: "#5c4a3d" },
              ].map((side) => (
                <div
                  key={side.label}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    background: "#f7efe5",
                    border: "3px solid #2d1f14",
                    borderRadius: 8,
                    padding: "12px 16px",
                    boxShadow: "4px 4px 0 #2d1f14",
                  }}
                >
                  <div style={{ display: "flex", fontSize: 15, color: side.accent, fontWeight: 700 }}>
                    {side.label}
                  </div>
                  <div style={{ display: "flex", fontFamily: "Luckiest Guy", fontSize: 30 }}>
                    {teamLabel(side.t.team)}
                  </div>
                  <div style={{ display: "flex", fontSize: 20, color: "#5c4a3d" }}>
                    {side.t.record} · {side.t.ppg} ppg
                  </div>
                </div>
              ))}
            </div>

            {/* Position depth bars */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                background: "#f7efe5",
                border: "3px solid #2d1f14",
                borderRadius: 8,
                padding: "12px 16px",
                boxShadow: "4px 4px 0 #2d1f14",
              }}
            >
              <div style={{ display: "flex", fontSize: 14, color: "#8a7565" }}>position depth</div>
              {positionCompare.map((row) => {
                const total = Math.max(1, row.your_count + row.their_count);
                const edge = row.your_count - row.their_count;
                const edgeLabel = edge > 0 ? `+${edge} you` : edge < 0 ? `+${Math.abs(edge)} them` : "even";
                return (
                  <div key={row.position} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 18 }}>
                    <div style={{ display: "flex", width: 44, fontWeight: 700 }}>{row.position}</div>
                    <div
                      style={{
                        display: "flex",
                        flex: 1,
                        height: 16,
                        background: "#e5d6c4",
                        borderRadius: 4,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          width: `${(row.your_count / total) * 100}%`,
                          background: "#d97757",
                        }}
                      />
                    </div>
                    <div style={{ display: "flex", width: 150, justifyContent: "flex-end", color: "#5c4a3d", fontSize: 15 }}>
                      {row.your_count}–{row.their_count} · {edgeLabel}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Trade lanes */}
            <div style={{ display: "flex", fontFamily: "Caveat", fontSize: 30, color: "#d97757" }}>
              You offer depth at {offer} · target their surplus at {want}
            </div>
          </div>
        ) : null}

        {/* Footer */}
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
          <div style={{ display: "flex" }}>razzle.lol/league{league ? `/${league}` : ""}/head-to-head</div>
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
