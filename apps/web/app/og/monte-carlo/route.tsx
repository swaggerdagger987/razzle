import { ImageResponse } from "next/og";
import { AGENT_BY_ID } from "@razzle/agents";
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

async function fetchMonteCarlo(leagueId: string, userId: string): Promise<OddsRow[] | null> {
  const apiOrigin = process.env.NEXT_PUBLIC_API_ORIGIN || "http://127.0.0.1:8000";
  if (!leagueId || !userId) return null;

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
  const live = snapshot?.rows?.length ? null : await fetchMonteCarlo(league, user);
  const fromSnapshot = snapshot?.rows?.length ? snapshot.rows : null;
  const isDemo = !fromSnapshot?.length && !live?.length;
  const odds = (fromSnapshot ?? (isDemo ? DEMO_ODDS : live!)).slice(0, 3);
  const fromPanel = Boolean(fromSnapshot?.length);
  const scenario = snapshot?.scenario;
  const hasScenario = Boolean(scenario?.giveName && scenario?.getName);

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
        <div style={{ display: "flex", fontSize: 20, color: "#5c4a3d", marginBottom: hasScenario ? 12 : 20 }}>
          {`playoff + title odds from roster sims${fromPanel ? " · from your board" : isDemo ? " · sample preview" : ""}`}
        </div>

        {hasScenario && scenario ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              background: "#f7efe5",
              border: "3px solid #d97757",
              borderRadius: 8,
              padding: "12px 16px",
              marginBottom: 12,
              boxShadow: "4px 4px 0 #2d1f14",
            }}
          >
            <div style={{ display: "flex", fontSize: 14, color: "#d97757", textTransform: "uppercase", marginBottom: 6 }}>
              what-if trade
            </div>
            <div style={{ display: "flex", fontSize: 18, color: "#2d1f14", marginBottom: 8 }}>
              {`Send ${scenario.giveName} to ${scenario.partnerTeam} for ${scenario.getName}.`}
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", fontSize: 32, color: "#d97757", fontWeight: 700 }}>
                  {`${scenario.deltaChamp >= 0 ? "+" : ""}${scenario.deltaChamp}%`}
                </div>
                <div style={{ display: "flex", fontSize: 12, color: "#5c4a3d" }}>title odds shift</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", fontSize: 32, color: "#2ec4b6", fontWeight: 700 }}>
                  {`${scenario.deltaPlayoff >= 0 ? "+" : ""}${scenario.deltaPlayoff}%`}
                </div>
                <div style={{ display: "flex", fontSize: 12, color: "#5c4a3d" }}>playoff odds shift</div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", fontSize: 16, color: "#5c4a3d" }}>
                {`${scenario.baselineChamp}% → ${scenario.scenarioChamp}% title`}
              </div>
            </div>
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
            razzle.lol/league{league ? `/${league}` : ""}/monte-carlo
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
