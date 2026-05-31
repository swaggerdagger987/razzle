import { ImageResponse } from "next/og";
import { AGENT_BY_ID } from "@razzle/agents";
import { toLeague, toRoom } from "@razzle/hallway";

export const runtime = "edge";

type ProfileRow = {
  roster_id: number;
  team: string;
  record: string;
  archetype: string;
  exploit_window: string;
  panic_score: number;
  moves_per_season: number;
};

type ProfileData = {
  season?: string | number;
  rows?: ProfileRow[];
  error?: string;
};

const DEMO_ROWS: ProfileRow[] = [
  {
    roster_id: 1,
    team: "Rebuild FC",
    record: "3-10",
    archetype: "PANIC SELLER",
    exploit_window: "Strike now — they overreact after losses",
    panic_score: 82,
    moves_per_season: 42,
  },
  {
    roster_id: 2,
    team: "Win-Now LLC",
    record: "5-8",
    archetype: "AGGRESSIVE",
    exploit_window: "Package 2-for-1 before deadline",
    panic_score: 58,
    moves_per_season: 31,
  },
  {
    roster_id: 3,
    team: "Dynasty Dukes",
    record: "7-6",
    archetype: "HOARDER",
    exploit_window: "Offer picks — they rarely move studs",
    panic_score: 22,
    moves_per_season: 18,
  },
  {
    roster_id: 4,
    team: "Comfort Crew",
    record: "9-4",
    archetype: "PATIENT",
    exploit_window: "Wait for bye-week panic offers",
    panic_score: 12,
    moves_per_season: 14,
  },
];

const ARCHETYPE_COLORS: Record<string, string> = {
  "PANIC SELLER": "#e63946",
  AGGRESSIVE: "#d97757",
  HOARDER: "#2ec4b6",
  PATIENT: "#5b7fff",
  STEADY: "#5c4a3d",
};

const DEMO_META = { season: "2025", hero_team: "Rebuild FC", hero_archetype: "PANIC SELLER" };

/** Edge OG must hit same-origin `/api/*` so Next rewrites reach FastAPI (dev/preview/CI). */
function resolveApiOrigin(req: Request): string {
  return new URL(req.url).origin;
}

async function fetchManagerProfiles(req: Request, leagueId: string): Promise<ProfileData | null> {
  if (!leagueId) return null;
  const apiOrigin = resolveApiOrigin(req);

  try {
    const res = await fetch(`${apiOrigin}/api/bureau/manager-profiles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ league_id: leagueId }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as ProfileData;
    if (data.error || !data.rows?.length) return null;
    return data;
  } catch {
    return null;
  }
}

function teamLabel(name: string): string {
  return name.length > 14 ? `${name.slice(0, 12)}…` : name;
}

function bonesManagerProfilesRoomQuestion(heroTeam: string, heroArchetype: string): string {
  return `${heroTeam} is a ${heroArchetype} — when should I send a trade offer?`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const isDownload = url.searchParams.get("download") === "1";
  const league = url.searchParams.get("league") ?? "";

  const bones = AGENT_BY_ID.bones;
  const live = await fetchManagerProfiles(req, league);
  const isLive = Boolean(live?.rows?.length);
  const isDemo = !isLive;
  const rows = (isDemo ? DEMO_ROWS : live!.rows!).slice(0, 4);
  const season = isDemo ? DEMO_META.season : live!.season;
  const hero = rows.find((r) => r.archetype === "PANIC SELLER") ?? rows[0];
  const heroTeam = isDemo ? DEMO_META.hero_team : hero?.team;
  const heroArchetype = isDemo ? DEMO_META.hero_archetype : hero?.archetype;
  const hasHero = Boolean(heroTeam && heroArchetype);
  const leagueDeepLink = league ? toLeague(league, "manager-profiles") : "/league/manager-profiles";
  const bonesRoomPath = hasHero
    ? toRoom({
        agentId: "bones",
        question: bonesManagerProfilesRoomQuestion(heroTeam!, heroArchetype!),
        panelSlug: "manager-profiles",
      })
    : "/room?agent=bones&from=manager-profiles";

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
          Manager Profiles
        </div>
        <div style={{ display: "flex", fontSize: 20, color: "#5c4a3d", marginBottom: 10 }}>
          {`manager archetypes · ${season} season`}
          {isLive ? " · live league data" : isDemo ? " · sample preview" : ""}
        </div>

        {hasHero ? (
          <div
            style={{
              display: "flex",
              fontFamily: "Caveat",
              fontSize: 28,
              color: "#d97757",
              marginBottom: 10,
            }}
          >
            {`${heroTeam} is a ${heroArchetype} — read the room before you offer`}
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            flex: 1,
            background: "#f7efe5",
            border: "3px solid #2d1f14",
            borderRadius: 8,
            padding: "12px 16px",
            boxShadow: "4px 4px 0 #2d1f14",
          }}
        >
          {rows.map((row) => {
            const color = ARCHETYPE_COLORS[row.archetype] ?? "#5c4a3d";
            return (
              <div
                key={row.roster_id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  padding: "8px 10px",
                  background: "#ede0cf",
                  border: "2px solid #2d1f14",
                  borderRadius: 6,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", fontSize: 20, fontWeight: 700 }}>{teamLabel(row.team)}</div>
                  <div
                    style={{
                      display: "flex",
                      fontSize: 12,
                      fontWeight: 700,
                      color,
                      border: `2px solid ${color}`,
                      padding: "2px 8px",
                      borderRadius: 4,
                    }}
                  >
                    {row.archetype}
                  </div>
                </div>
                <div style={{ display: "flex", fontSize: 14, color: "#8a7565" }}>
                  {`${row.record} · panic ${row.panic_score}% · ${row.moves_per_season.toFixed(0)} moves/yr`}
                </div>
                <div style={{ display: "flex", fontSize: 15, color: "#5c4a3d" }}>{row.exploit_window}</div>
              </div>
            );
          })}
        </div>

        {hasHero ? (
          <div style={{ display: "flex", fontSize: 18, color: "#d97757", marginTop: 10 }}>
            {`razzle.lol${bonesRoomPath} · ask ${bones.name} about ${teamLabel(heroTeam!)}`}
          </div>
        ) : null}

        {/* Always-on watermark band — matches Pressure Map + Trade Finder OG (T6) */}
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
