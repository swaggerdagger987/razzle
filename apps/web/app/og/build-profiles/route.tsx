import { ImageResponse } from "next/og";
import { AGENT_BY_ID } from "@razzle/agents";

export const runtime = "edge";

type BuildRow = {
  roster_id: number;
  team: string;
  record: string;
  archetype: string;
  reasoning: string;
};

type BuildData = {
  league_id?: string;
  rows?: BuildRow[];
  error?: string;
};

const DEMO_ROWS: BuildRow[] = [
  {
    roster_id: 1,
    team: "Win-Now LLC",
    record: "9-4",
    archetype: "Win Now",
    reasoning: "Stacked RB room + aging WR core — push chips in now",
  },
  {
    roster_id: 2,
    team: "Zero RB FC",
    record: "7-6",
    archetype: "Zero RB",
    reasoning: "WR-heavy build with late-round RB dart throws",
  },
  {
    roster_id: 3,
    team: "Hero RB Crew",
    record: "8-5",
    archetype: "Hero RB",
    reasoning: "One elite RB anchor with mid-tier WR depth",
  },
  {
    roster_id: 4,
    team: "Rebuild United",
    record: "4-9",
    archetype: "Youth Movement",
    reasoning: "Rookie-heavy roster hoarding picks for next season",
  },
  {
    roster_id: 5,
    team: "Balanced Bros",
    record: "6-7",
    archetype: "Balanced",
    reasoning: "Even positional distribution — no clear construction edge",
  },
];

const ARCHETYPE_COLORS: Record<string, string> = {
  "Win Now": "#d97757",
  "Zero RB": "#d97757",
  "Hero RB": "#2ec4b6",
  "Stars & Scrubs": "#8b5cf6",
  "Youth Movement": "#5b7fff",
  Balanced: "#5c4a3d",
};

const DEMO_HERO = DEMO_ROWS[0];

async function fetchBuildProfiles(leagueId: string): Promise<BuildData | null> {
  const apiOrigin = process.env.NEXT_PUBLIC_API_ORIGIN || "http://127.0.0.1:8000";
  if (!leagueId) return null;

  try {
    const res = await fetch(`${apiOrigin}/api/bureau/build-profiles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ league_id: leagueId }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as BuildData;
    if (data.error || !data.rows?.length) return null;
    return data;
  } catch {
    return null;
  }
}

function teamLabel(name: string): string {
  return name.length > 16 ? `${name.slice(0, 14)}…` : name;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const isDownload = url.searchParams.get("download") === "1";
  const league = url.searchParams.get("league") ?? "";

  const atlas = AGENT_BY_ID.atlas;
  const live = await fetchBuildProfiles(league);
  const isDemo = !live?.rows?.length;
  const rows = (isDemo ? DEMO_ROWS : live!.rows!).slice(0, 5);
  const hero = isDemo ? DEMO_HERO : rows.find((r) => r.archetype === "Win Now") ?? rows[0];

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
            <span style={{ display: "flex", fontSize: 24 }}>{atlas.emoji}</span>
            <span style={{ display: "flex" }}>{atlas.name}</span>
          </div>
        </div>

        <div style={{ display: "flex", fontFamily: "Luckiest Guy", fontSize: 56, lineHeight: 1.1, marginBottom: 4 }}>
          Build Profiles
        </div>
        <div style={{ display: "flex", fontSize: 20, color: "#5c4a3d", marginBottom: 14 }}>
          {`roster construction archetypes${isDemo ? " · sample preview" : ""}`}
        </div>

        {hero ? (
          <div
            style={{
              display: "flex",
              fontFamily: "Caveat",
              fontSize: 30,
              color: "#d97757",
              marginBottom: 12,
            }}
          >
            {`${hero.team} — ${hero.archetype}`}
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
            const color = ARCHETYPE_COLORS[row.archetype] ?? "#5c4a3d";
            return (
              <div key={row.roster_id} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ display: "flex", width: 180, flexDirection: "column" }}>
                  <div style={{ display: "flex", fontSize: 18, fontWeight: 700 }}>
                    {teamLabel(row.team)}
                  </div>
                  <div style={{ display: "flex", fontSize: 14, color: "#8a7565" }}>{row.record}</div>
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: 13,
                    fontWeight: 700,
                    color,
                    border: `2px solid ${color}`,
                    padding: "2px 8px",
                    borderRadius: 6,
                    textTransform: "uppercase",
                  }}
                >
                  {row.archetype}
                </div>
                <div
                  style={{
                    display: "flex",
                    flex: 1,
                    fontSize: 14,
                    color: "#5c4a3d",
                    fontFamily: "Caveat",
                    lineHeight: 1.2,
                  }}
                >
                  {row.reasoning.length > 48 ? `${row.reasoning.slice(0, 46)}…` : row.reasoning}
                </div>
              </div>
            );
          })}
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
          <div style={{ display: "flex" }}>{`razzle.lol/league${league ? `/${league}` : ""}/build-profiles`}</div>
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
