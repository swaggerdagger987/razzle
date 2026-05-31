import { ImageResponse } from "next/og";
import { AGENT_BY_ID } from "@razzle/agents";
import { toLeague } from "@razzle/hallway";
import { decodeBureauMonteCarloOgSnapshot } from "@/lib/bureau-monte-carlo-og-snapshot";

export const runtime = "edge";

type OddsRow = {
  manager: string;
  championship_pct: number;
  playoff_pct: number;
  roster_power: number;
};

const DEMO_ODDS: OddsRow[] = [
  { manager: "Dynasty Dukes", championship_pct: 28, playoff_pct: 91, roster_power: 94 },
  { manager: "Rebuild FC", championship_pct: 19, playoff_pct: 78, roster_power: 86 },
  { manager: "Your Squad", championship_pct: 14, playoff_pct: 62, roster_power: 81 },
];

/** Edge OG must hit same-origin `/api/*` so Next rewrites reach FastAPI (dev/preview/CI). */
function resolveApiOrigin(req: Request): string {
  return new URL(req.url).origin;
}

async function fetchMonteCarlo(
  req: Request,
  leagueId: string,
  userId: string,
): Promise<OddsRow[] | null> {
  if (!leagueId || !userId) return null;
  const apiOrigin = resolveApiOrigin(req);

  try {
    const res = await fetch(`${apiOrigin}/api/bureau/monte-carlo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ league_id: leagueId, user_id: userId }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { odds?: OddsRow[]; error?: string };
    if (data.error || !data.odds?.length) return null;
    return data.odds.slice(0, 3);
  } catch {
    return null;
  }
}

function barWidth(pct: number, scale = 2): string {
  return `${Math.min(100, pct * scale)}%`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const isDownload = url.searchParams.get("download") === "1";
  const league = url.searchParams.get("league") ?? "";
  const user = url.searchParams.get("user") ?? "";
  const snapshotParam = url.searchParams.get("snapshot") ?? "";
  const snapshot = snapshotParam ? decodeBureauMonteCarloOgSnapshot(snapshotParam) : null;

  const octo = AGENT_BY_ID.octo;
  const isSnapshot = Boolean(snapshot?.rows?.length);
  const live = isSnapshot ? null : await fetchMonteCarlo(req, league, user);
  const fromSnapshot = snapshot?.rows?.length ? snapshot.rows : null;
  const isLive = !isSnapshot && Boolean(live?.length);
  const isDemo = !isSnapshot && !isLive;
  const odds = (fromSnapshot ?? (isDemo ? DEMO_ODDS : live!)).slice(0, 3);
  const leagueDeepLink = league ? toLeague(league, "monte-carlo") : "/league/monte-carlo";

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

        <div style={{ display: "flex", fontFamily: "Luckiest Guy", fontSize: 56, lineHeight: 1.1, marginBottom: 4 }}>
          Monte Carlo
        </div>
        <div style={{ display: "flex", fontSize: 20, color: "#5c4a3d", marginBottom: 16 }}>
          {`playoff + title odds from roster sims${
            isSnapshot ? " · exported from panel" : isDemo ? " · sample preview" : ""
          }`}
        </div>

        {isSnapshot ? (
          <div
            style={{
              fontFamily: "Caveat",
              fontSize: 32,
              color: "#f7efe5",
              background: "#8b5cf6",
              padding: "6px 18px",
              alignSelf: "flex-start",
              border: "3px solid #2d1f14",
              borderRadius: 10,
              boxShadow: "4px 4px 0 #2d1f14",
              transform: "rotate(-1.5deg)",
              marginBottom: 12,
              fontWeight: 700,
              display: "flex",
            }}
          >
            EXPORTED · panel sim rows
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
            LIVE · Sleeper sim odds
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
            SAMPLE · demo title odds
          </div>
        ) : null}

        <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
          {odds.map((o, i) => (
            <div
              key={`${o.manager}-${i}`}
              style={{
                display: "flex",
                flexDirection: "column",
                background: "#f7efe5",
                border: "3px solid #2d1f14",
                borderRadius: 8,
                padding: "14px 18px",
                boxShadow: "4px 4px 0 #2d1f14",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", fontFamily: "Luckiest Guy", fontSize: 28 }}>
                  {o.manager}
                </div>
                <div style={{ display: "flex", fontSize: 16, color: "#8a7565" }}>#{i + 1}</div>
              </div>
              <div style={{ display: "flex", gap: 24, marginBottom: 8 }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", fontSize: 36, color: "#d97757", fontWeight: 700 }}>
                    {o.championship_pct}%
                  </div>
                  <div style={{ display: "flex", fontSize: 14, color: "#5c4a3d" }}>title</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", fontSize: 30, color: "#2ec4b6", fontWeight: 700 }}>
                    {o.playoff_pct}%
                  </div>
                  <div style={{ display: "flex", fontSize: 14, color: "#5c4a3d" }}>playoffs</div>
                </div>
                <div style={{ display: "flex", flex: 1, alignItems: "flex-end", justifyContent: "flex-end", fontSize: 16, color: "#5c4a3d" }}>
                  {`power ${o.roster_power}`}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div
                  style={{
                    display: "flex",
                    height: 12,
                    background: "#e5d6c4",
                    border: "2px solid #2d1f14",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div style={{ display: "flex", width: barWidth(o.championship_pct), background: "#d97757" }} />
                </div>
                <div
                  style={{
                    display: "flex",
                    height: 12,
                    background: "#e5d6c4",
                    border: "2px solid #2d1f14",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div style={{ display: "flex", width: `${Math.min(100, o.playoff_pct)}%`, background: "#2ec4b6" }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Always-on watermark band — matches H2H + Trade Finder OG (T6 screenshot gravity) */}
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
