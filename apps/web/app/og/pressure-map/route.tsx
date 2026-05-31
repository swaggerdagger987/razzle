import { ImageResponse } from "next/og";
import { AGENT_BY_ID } from "@razzle/agents";
import { toLeague, toRoom } from "@razzle/hallway";

export const runtime = "edge";

type PressureRow = {
  roster_id: number;
  team: string;
  record: string;
  score: number;
  label: string;
  trades: number;
};

type PressureData = {
  season?: string | number;
  rows?: PressureRow[];
  hero_manager?: string;
  hero_score?: number;
  error?: string;
};

const DEMO_ROWS: PressureRow[] = [
  { roster_id: 1, team: "Rebuild FC", record: "3-10", score: 78, label: "desperate", trades: 6 },
  { roster_id: 2, team: "Win-Now LLC", record: "5-8", score: 52, label: "motivated", trades: 4 },
  { roster_id: 3, team: "Dynasty Dukes", record: "7-6", score: 41, label: "motivated", trades: 3 },
  { roster_id: 4, team: "Comfort Crew", record: "9-4", score: 18, label: "comfortable", trades: 1 },
];

const DEMO_META = { season: "2025", hero_manager: "Rebuild FC", hero_score: 78 };

function barColor(score: number): string {
  if (score >= 60) return "#e63946";
  if (score >= 35) return "#d97757";
  return "#2ec4b6";
}

/** Edge OG must hit same-origin `/api/*` so Next rewrites reach FastAPI (dev/preview/CI). */
function resolveApiOrigin(req: Request): string {
  return new URL(req.url).origin;
}

async function fetchPressureMap(req: Request, leagueId: string): Promise<PressureData | null> {
  if (!leagueId) return null;
  const apiOrigin = resolveApiOrigin(req);

  try {
    const res = await fetch(`${apiOrigin}/api/bureau/pressure-map`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ league_id: leagueId }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as PressureData;
    if (data.error || !data.rows?.length) return null;
    return data;
  } catch {
    return null;
  }
}

function teamLabel(name: string): string {
  return name.length > 16 ? `${name.slice(0, 14)}…` : name;
}

function bonesPressureMapRoomQuestion(heroTeam: string, heroScore: number): string {
  return `${heroTeam} has pressure score ${heroScore} — what trade angle works before the deadline?`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const isDownload = url.searchParams.get("download") === "1";
  const league = url.searchParams.get("league") ?? "";

  const bones = AGENT_BY_ID.bones;
  const live = await fetchPressureMap(req, league);
  const isLive = Boolean(live?.rows?.length);
  const isDemo = !isLive;
  const rows = (isDemo ? DEMO_ROWS : live!.rows!).slice(0, 5);
  const season = isDemo ? DEMO_META.season : live!.season;
  const heroTeam = isDemo ? DEMO_META.hero_manager : live!.hero_manager;
  const heroScore = isDemo ? DEMO_META.hero_score : live!.hero_score;
  const hasHero = Boolean(heroTeam && heroScore != null);
  const leagueDeepLink = league ? toLeague(league, "pressure-map") : "/league/pressure-map";
  const bonesRoomPath = hasHero
    ? toRoom({
        agentId: "bones",
        question: bonesPressureMapRoomQuestion(heroTeam!, heroScore!),
        panelSlug: "pressure-map",
      })
    : "/room?agent=bones&from=pressure-map";

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
            <span style={{ display: "flex", fontSize: 24 }}>{bones.emoji}</span>
            <span style={{ display: "flex" }}>{bones.name}</span>
          </div>
        </div>

        <div style={{ display: "flex", fontFamily: "Luckiest Guy", fontSize: 56, lineHeight: 1.1, marginBottom: 4 }}>
          Pressure Map
        </div>
        <div style={{ display: "flex", fontSize: 20, color: "#5c4a3d", marginBottom: 14 }}>
          {`trade deadline desperation · ${season} season`}
          {isLive ? " · live league data" : isDemo ? " · sample preview" : ""}
        </div>

        {hasHero ? (
          <div
            style={{
              display: "flex",
              fontFamily: "Caveat",
              fontSize: 30,
              color: "#d97757",
              marginBottom: 12,
            }}
          >
            {`${heroTeam} leads at ${heroScore} — strike before the deadline`}
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            flex: 1,
            background: "#f7efe5",
            border: "3px solid #2d1f14",
            borderRadius: 8,
            padding: "14px 18px",
            boxShadow: "4px 4px 0 #2d1f14",
          }}
        >
          {rows.map((row) => {
            const color = barColor(row.score);
            return (
              <div key={row.roster_id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", width: 130, flexDirection: "column" }}>
                  <div style={{ display: "flex", fontSize: 18, fontWeight: 700 }}>{teamLabel(row.team)}</div>
                  <div style={{ display: "flex", fontSize: 14, color: "#8a7565" }}>{row.record}</div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flex: 1,
                    height: 18,
                    background: "#e5d6c4",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div style={{ display: "flex", width: `${row.score}%`, background: color }} />
                </div>
                <div style={{ display: "flex", width: 44, fontSize: 18, fontWeight: 700, color }}>{row.score}</div>
                <div
                  style={{
                    display: "flex",
                    fontSize: 14,
                    color,
                    border: `2px solid ${color}`,
                    padding: "2px 8px",
                    borderRadius: 6,
                  }}
                >
                  {row.label}
                </div>
              </div>
            );
          })}
        </div>

        {hasHero ? (
          <div style={{ display: "flex", fontSize: 18, color: "#d97757", marginTop: 10 }}>
            {`razzle.lol${bonesRoomPath} · ask ${bones.name} about ${teamLabel(heroTeam!)}`}
          </div>
        ) : null}

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
