import { ImageResponse } from "next/og";
import { AGENT_BY_ID } from "@razzle/agents";
import { toRoom } from "@razzle/hallway";
import {
  bureauH2HOgSnapshotToData,
  decodeBureauH2HOgSnapshot,
  type H2HData,
} from "@/lib/bureau-h2h-og-snapshot";

export const runtime = "edge";

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

/** Edge OG must hit same-origin `/api/*` so Next rewrites reach FastAPI (dev/preview/CI). */
function resolveApiOrigin(req: Request): string {
  return new URL(req.url).origin;
}

async function fetchH2H(
  req: Request,
  params: {
    league: string;
    user: string;
    opponent: string;
  },
): Promise<H2HData | null> {
  if (!params.league || !params.user) return null;
  const apiOrigin = resolveApiOrigin(req);

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

function atlasH2hRoomQuestion(
  them: { team: string; record: string; ppg: number },
  offer: string,
  want: string,
): string {
  return `How do I beat ${them.team} (${them.record})? I'm deeper at ${offer} and thin at ${want}.`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const isDownload = url.searchParams.get("download") === "1";
  const league = url.searchParams.get("league") ?? "";
  const user = url.searchParams.get("user") ?? "";
  const opponent = url.searchParams.get("opponent") ?? "";
  const snapshotParam = url.searchParams.get("snapshot") ?? "";

  const atlas = AGENT_BY_ID.atlas;
  const snapshot = snapshotParam ? decodeBureauH2HOgSnapshot(snapshotParam) : null;
  const isSnapshot = Boolean(snapshot);
  const hasLeagueParams = Boolean(league && user);
  const live = isSnapshot ? null : await fetchH2H(req, { league, user, opponent });
  const isLive = !isSnapshot && Boolean(live?.you && live?.them);
  const isDemo = !isSnapshot && !isLive;
  const data: H2HData =
    isSnapshot && snapshot
      ? bureauH2HOgSnapshotToData(snapshot)
      : isLive
        ? live!
        : DEMO_H2H;

  const you = data.you;
  const them = data.them;
  const positionCompare = data.position_compare ?? [];
  const offer = (data.trade_fit?.you_could_offer ?? []).join(", ") || "—";
  const want = (data.trade_fit?.you_could_target ?? []).join(", ") || "—";
  const hasData = Boolean(you && them);
  const themSummary = them!;
  const atlasRoomPath = hasData
    ? toRoom({
        agentId: "atlas",
        question: atlasH2hRoomQuestion(themSummary, offer, want),
        panelSlug: "head-to-head",
      })
    : "/room?agent=atlas&from=head-to-head";

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

        <div style={{ fontFamily: "Luckiest Guy", fontSize: 56, lineHeight: 1.1, marginBottom: 4 }}>
          Head-to-Head
        </div>
        <div style={{ display: "flex", fontSize: 20, color: "#5c4a3d", marginBottom: 12 }}>
          {`rivalry dossier — your roster vs one leaguemate${
            isSnapshot
              ? " · exported matchup"
              : isLive
                ? " · live league data"
                : hasLeagueParams && isDemo
                  ? " · sample preview (API unavailable)"
                  : " · sample preview"
          }`}
        </div>

        {isDemo ? (
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
              transform: "rotate(2deg)",
              marginBottom: 12,
              fontWeight: 700,
              display: "flex",
            }}
          >
            SAMPLE · demo rivalry
          </div>
        ) : null}

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
            LIVE · Sleeper rivalry
          </div>
        ) : null}

        {hasData ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
            <div style={{ display: "flex", gap: 14 }}>
              {[
                { label: "YOU", t: you!, accent: "#d97757" },
                { label: "THEM", t: them!, accent: "#5c4a3d" },
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

            <div style={{ display: "flex", fontFamily: "Caveat", fontSize: 30, color: "#d97757" }}>
              You offer depth at {offer} · target their surplus at {want}
            </div>
          </div>
        ) : null}

        {hasData ? (
          <div style={{ display: "flex", fontSize: 18, color: "#d97757", marginTop: 10 }}>
            {`razzle.lol${atlasRoomPath} · ask ${atlas.name} about ${teamLabel(themSummary.team)}`}
          </div>
        ) : null}

        {/* Always-on watermark band — matches Explore + Lab panel OG (T6 screenshot gravity) */}
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
          <div style={{ display: "flex", fontWeight: 700 }}>
            razzle.lol/league{league ? `/${league}` : ""}/head-to-head
          </div>
          <div style={{ display: "flex", fontFamily: "Caveat", fontSize: 30 }}>
            {`made with 🐯 razzle.lol${isDownload ? " · export" : ""}`}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
