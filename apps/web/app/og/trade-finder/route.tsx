import { ImageResponse } from "next/og";
import { AGENT_BY_ID } from "@razzle/agents";
import { toLeague } from "@razzle/hallway";
import { decodeBureauTradeFinderOgSnapshot } from "@/lib/bureau-trade-finder-og-snapshot";

export const runtime = "edge";

type PlayerRef = {
  player_id: string;
  name: string;
  position: string;
  dynasty_value: number;
};

type Match = {
  partner_roster_id: number;
  partner_team: string;
  give: PlayerRef;
  get: PlayerRef;
  value_gap: number;
  gap_pct: number;
};

type TradeFinderData = {
  matches?: Match[];
  hero_match?: Match | null;
  needs?: string[];
  surplus?: string[];
  error?: string;
};

const DEMO_MATCHES: Match[] = [
  {
    partner_roster_id: 2,
    partner_team: "Rebuild FC",
    give: { player_id: "p1", name: "J. Gibbs", position: "RB", dynasty_value: 8420 },
    get: { player_id: "p2", name: "C. Lamb", position: "WR", dynasty_value: 8310 },
    value_gap: 110,
    gap_pct: 1.3,
  },
  {
    partner_roster_id: 4,
    partner_team: "Win-Now LLC",
    give: { player_id: "p3", name: "B. Bowers", position: "TE", dynasty_value: 6120 },
    get: { player_id: "p4", name: "D. Achane", position: "RB", dynasty_value: 5980 },
    value_gap: 140,
    gap_pct: 2.3,
  },
  {
    partner_roster_id: 6,
    partner_team: "Dynasty Dukes",
    give: { player_id: "p5", name: "M. Nabers", position: "WR", dynasty_value: 7210 },
    get: { player_id: "p6", name: "J. Taylor", position: "RB", dynasty_value: 7050 },
    value_gap: 160,
    gap_pct: 2.2,
  },
];

const DEMO_META = {
  needs: ["WR", "TE"],
  surplus: ["RB"],
};

/** Edge OG must hit same-origin `/api/*` so Next rewrites reach FastAPI (dev/preview/CI). */
function resolveApiOrigin(req: Request): string {
  return new URL(req.url).origin;
}

async function fetchTradeFinder(
  req: Request,
  leagueId: string,
  userId: string,
): Promise<TradeFinderData | null> {
  if (!leagueId || !userId) return null;
  const apiOrigin = resolveApiOrigin(req);

  try {
    const res = await fetch(`${apiOrigin}/api/bureau/trade-finder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ league_id: leagueId, user_id: userId }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as TradeFinderData;
    if (data.error || !data.matches?.length) return null;
    return data;
  } catch {
    return null;
  }
}

function playerLabel(name: string): string {
  return name.length > 16 ? `${name.slice(0, 14)}…` : name;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const isDownload = url.searchParams.get("download") === "1";
  const league = url.searchParams.get("league") ?? "";
  const user = url.searchParams.get("user") ?? "";
  const snapshotParam = url.searchParams.get("snapshot") ?? "";

  const bones = AGENT_BY_ID.bones;
  const snapshot = snapshotParam ? decodeBureauTradeFinderOgSnapshot(snapshotParam) : null;
  const isSnapshot = Boolean(snapshot?.matches?.length);
  const live = isSnapshot ? null : await fetchTradeFinder(req, league, user);
  const isLive = isSnapshot || Boolean(live?.matches?.length);
  const isDemo = !isLive;
  const panelData = isSnapshot
    ? snapshot!
    : live?.matches?.length
      ? live
      : null;
  const matches = isDemo ? DEMO_MATCHES : panelData!.matches!.slice(0, 3);
  const hero = isDemo ? DEMO_MATCHES[0] : (panelData!.hero_match ?? matches[0]);
  const needs = isDemo ? DEMO_META.needs : (panelData!.needs ?? []);
  const surplus = isDemo ? DEMO_META.surplus : (panelData!.surplus ?? []);
  const leagueDeepLink = league ? toLeague(league, "trade-finder") : "/league/trade-finder";

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
            <span style={{ fontSize: 24 }}>{bones.emoji}</span>
            <span>{bones.name}</span>
          </div>
        </div>

        <div style={{ display: "flex", fontFamily: "Luckiest Guy", fontSize: 56, lineHeight: 1.1, marginBottom: 4 }}>
          Trade Finder
        </div>
        <div style={{ display: "flex", fontSize: 20, color: "#5c4a3d", marginBottom: 16 }}>
          {`value-matched league trades${isDemo ? " · sample preview" : isSnapshot ? " · your board" : ""}`}
          {needs.length ? ` · need ${needs.join(", ")}` : ""}
          {surplus.length ? ` · surplus ${surplus.join(", ")}` : ""}
        </div>

        {isSnapshot ? (
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
            PANEL · Bones trade board
          </div>
        ) : null}

        {isLive && !isSnapshot ? (
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
            LIVE · Sleeper trade paths
          </div>
        ) : null}

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
              transform: "rotate(1.5deg)",
              marginBottom: 12,
              fontWeight: 700,
              display: "flex",
            }}
          >
            SAMPLE · demo trade rows
          </div>
        ) : null}

        {hero ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              background: "#f7efe5",
              border: "3px solid #2d1f14",
              borderRadius: 8,
              padding: "16px 20px",
              boxShadow: "4px 4px 0 #2d1f14",
              marginBottom: 14,
            }}
          >
            <div style={{ display: "flex", fontSize: 14, color: "#8a7565", marginBottom: 6 }}>top match</div>
            <div style={{ display: "flex", fontFamily: "Luckiest Guy", fontSize: 32, marginBottom: 8 }}>
              {hero.partner_team}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22 }}>
              <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{ display: "flex", fontWeight: 700 }}>{playerLabel(hero.give.name)}</div>
                <div style={{ display: "flex", fontSize: 16, color: "#5c4a3d" }}>
                  {hero.give.position} · {hero.give.dynasty_value.toLocaleString()}
                </div>
              </div>
              <div style={{ display: "flex", fontSize: 28, color: "#d97757" }}>⇄</div>
              <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{ display: "flex", fontWeight: 700 }}>{playerLabel(hero.get.name)}</div>
                <div style={{ display: "flex", fontSize: 16, color: "#5c4a3d" }}>
                  {hero.get.position} · {hero.get.dynasty_value.toLocaleString()}
                </div>
              </div>
              <div style={{ display: "flex", fontSize: 18, color: "#2ec4b6", fontWeight: 700 }}>
                {hero.gap_pct}% gap
              </div>
            </div>
          </div>
        ) : null}

        <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
          {matches.slice(hero ? 1 : 0).map((m, i) => (
            <div
              key={`${m.partner_roster_id}-${m.give.player_id}-${i}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                background: "#f7efe5",
                border: "3px solid #2d1f14",
                borderRadius: 8,
                padding: "12px 16px",
                boxShadow: "4px 4px 0 #2d1f14",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", width: 140 }}>
                <div style={{ display: "flex", fontSize: 13, color: "#8a7565" }}>{m.partner_team}</div>
                <div style={{ display: "flex", fontSize: 18, fontWeight: 700 }}>{playerLabel(m.give.name)}</div>
              </div>
              <div style={{ display: "flex", fontSize: 22, color: "#d97757" }}>→</div>
              <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{ display: "flex", fontSize: 18, fontWeight: 700 }}>{playerLabel(m.get.name)}</div>
                <div style={{ display: "flex", fontSize: 14, color: "#5c4a3d" }}>
                  {m.give.position} for {m.get.position}
                </div>
              </div>
              <div style={{ display: "flex", fontSize: 16, color: "#5c4a3d" }}>{m.gap_pct}%</div>
            </div>
          ))}
        </div>

        {/* Always-on watermark band — matches H2H + Lab panel OG (T6 screenshot gravity) */}
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
