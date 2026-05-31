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

const ARCHETYPE_COLORS: Record<string, string> = {
  "Hero RB": "#2ec4b6",
  "Zero RB": "#d97757",
  "Stars & Scrubs": "#8b5cf6",
  "Win Now": "#d97757",
  "Youth Movement": "#5b7fff",
  Balanced: "#5c4a3d",
};

const DEMO_ROWS: BuildRow[] = [
  {
    roster_id: 1,
    team: "Win-Now LLC",
    record: "9-4",
    archetype: "Win Now",
    reasoning: "Stacked win-now window — trades for ceiling, not picks",
  },
  {
    roster_id: 2,
    team: "Zero RB Club",
    record: "7-6",
    archetype: "Zero RB",
    reasoning: "WR room carries — thin at RB, elite pass-catchers",
  },
  {
    roster_id: 3,
    team: "Hero RB FC",
    record: "6-7",
    archetype: "Hero RB",
    reasoning: "One anchor RB — everything else is fungible depth",
  },
  {
    roster_id: 4,
    team: "Rebuild Crew",
    record: "3-10",
    archetype: "Youth Movement",
    reasoning: "Rookie-heavy roster — selling vets for future capital",
  },
];

const DEMO_META = { hero_team: "Win-Now LLC", hero_archetype: "Win Now", league_shape: "Win Now ×2 · Zero RB ×1" };

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
  return name.length > 14 ? `${name.slice(0, 12)}…` : name;
}

function leagueShape(rows: BuildRow[]): string {
  const counts = rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.archetype] = (acc[row.archetype] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => `${name} ×${count}`)
    .join(" · ");
}

function pickHero(rows: BuildRow[]): BuildRow {
  const winNow = rows.filter((r) => r.archetype === "Win Now");
  const zeroRb = rows.filter((r) => r.archetype === "Zero RB");
  return winNow[0] ?? zeroRb[0] ?? rows[0]!;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const isDownload = url.searchParams.get("download") === "1";
  const league = url.searchParams.get("league") ?? "";

  const atlas = AGENT_BY_ID.atlas;
  const live = await fetchBuildProfiles(league);
  const isDemo = !live?.rows?.length;
  const rows = (isDemo ? DEMO_ROWS : live!.rows!).slice(0, 4);
  const hero = pickHero(rows);
  const shape = isDemo ? DEMO_META.league_shape : leagueShape(live!.rows!);
  const heroTeam = isDemo ? DEMO_META.hero_team : hero.team;
  const heroArchetype = isDemo ? DEMO_META.hero_archetype : hero.archetype;

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
        <div style={{ display: "flex", fontSize: 20, color: "#5c4a3d", marginBottom: 10 }}>
          {`league construction · ${shape}${isDemo ? " · sample preview" : ""}`}
        </div>

        {heroTeam && heroArchetype ? (
          <div
            style={{
              display: "flex",
              fontFamily: "Caveat",
              fontSize: 28,
              color: "#d97757",
              marginBottom: 10,
            }}
          >
            {`${heroTeam} runs ${heroArchetype} — ${hero.reasoning.slice(0, 72)}${hero.reasoning.length > 72 ? "…" : ""}`}
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
                <div style={{ display: "flex", fontSize: 14, color: "#8a7565" }}>{row.record}</div>
                <div style={{ display: "flex", fontSize: 15, color: "#5c4a3d" }}>{row.reasoning}</div>
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
            marginTop: 12,
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
