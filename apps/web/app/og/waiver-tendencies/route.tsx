import { ImageResponse } from "next/og";
import { AGENT_BY_ID } from "@razzle/agents";

export const runtime = "edge";

type WaiverRow = {
  roster_id: number;
  team: string;
  adds: number;
  drops: number;
  faab_spent: number;
  claim_attempts: number;
  archetype: string;
};

type WaiverData = {
  league_id?: string;
  rows?: WaiverRow[];
  error?: string;
};

const ARCHETYPE_COLORS: Record<string, string> = {
  "The Hoarder (rare, expensive)": "#8b5cf6",
  "The Streamer (cheap, frequent)": "#2ec4b6",
  "The Active Manager (aggressive on both axes)": "#d97757",
  "The Opportunist": "#5b7fff",
  "The Set-and-Forget": "#5c4a3d",
};

const DEMO_ROWS: WaiverRow[] = [
  {
    roster_id: 1,
    team: "FAAB Dragon",
    adds: 3,
    drops: 2,
    faab_spent: 142,
    claim_attempts: 5,
    archetype: "The Hoarder (rare, expensive)",
  },
  {
    roster_id: 2,
    team: "Wire Hawk",
    adds: 14,
    drops: 11,
    faab_spent: 28,
    claim_attempts: 18,
    archetype: "The Streamer (cheap, frequent)",
  },
  {
    roster_id: 3,
    team: "Chaos Agent",
    adds: 11,
    drops: 9,
    faab_spent: 118,
    claim_attempts: 14,
    archetype: "The Active Manager (aggressive on both axes)",
  },
  {
    roster_id: 4,
    team: "Set & Forget",
    adds: 2,
    drops: 1,
    faab_spent: 12,
    claim_attempts: 3,
    archetype: "The Opportunist",
  },
];

const DEMO_META = {
  hero_team: "FAAB Dragon",
  hero_archetype: "The Hoarder (rare, expensive)",
  league_pulse: "Streamer ×2 · Hoarder ×1",
};

async function fetchWaiverTendencies(leagueId: string): Promise<WaiverData | null> {
  const apiOrigin = process.env.NEXT_PUBLIC_API_ORIGIN || "http://127.0.0.1:8000";
  if (!leagueId) return null;

  try {
    const res = await fetch(`${apiOrigin}/api/bureau/waiver-tendencies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ league_id: leagueId }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as WaiverData;
    if (data.error || !data.rows?.length) return null;
    return data;
  } catch {
    return null;
  }
}

function teamLabel(name: string): string {
  return name.length > 14 ? `${name.slice(0, 12)}…` : name;
}

function leaguePulse(rows: WaiverRow[]): string {
  const counts = rows.reduce<Record<string, number>>((acc, row) => {
    const key = row.archetype.split(" (")[0] ?? row.archetype;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => `${name.replace(/^The /, "")} ×${count}`)
    .join(" · ");
}

function pickHero(rows: WaiverRow[]): WaiverRow {
  const hoarder = rows.find((r) => r.archetype.includes("Hoarder"));
  const active = rows.find((r) => r.archetype.includes("Active"));
  const topFaab = [...rows].sort((a, b) => b.faab_spent - a.faab_spent)[0];
  return hoarder ?? active ?? topFaab ?? rows[0]!;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const isDownload = url.searchParams.get("download") === "1";
  const league = url.searchParams.get("league") ?? "";

  const hawkeye = AGENT_BY_ID.hawkeye;
  const live = await fetchWaiverTendencies(league);
  const isDemo = !live?.rows?.length;
  const rows = (isDemo ? DEMO_ROWS : live!.rows!).slice(0, 4);
  const hero = pickHero(rows);
  const pulse = isDemo ? DEMO_META.league_pulse : leaguePulse(live!.rows!);
  const heroTeam = isDemo ? DEMO_META.hero_team : hero.team;
  const heroArchetype = isDemo ? DEMO_META.hero_archetype : hero.archetype;
  const totalAdds = rows.reduce((n, r) => n + r.adds, 0);

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
            <span style={{ display: "flex", fontSize: 24 }}>{hawkeye.emoji}</span>
            <span style={{ display: "flex" }}>{hawkeye.name}</span>
          </div>
        </div>

        <div style={{ display: "flex", fontFamily: "Luckiest Guy", fontSize: 56, lineHeight: 1.1, marginBottom: 4 }}>
          Waiver Tendencies
        </div>
        <div style={{ display: "flex", fontSize: 20, color: "#5c4a3d", marginBottom: 10 }}>
          {`${rows.length} managers · ${totalAdds} adds · ${pulse}${isDemo ? " · sample preview" : ""}`}
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
            {`${heroTeam} — ${heroArchetype} · $${hero.faab_spent} FAAB · ${hero.adds} adds`}
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
            const faabBar = Math.min(100, Math.max(12, row.faab_spent / 2));
            return (
              <div
                key={row.roster_id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
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
                      fontSize: 11,
                      fontWeight: 700,
                      color,
                      border: `2px solid ${color}`,
                      padding: "2px 8px",
                      borderRadius: 4,
                      maxWidth: 280,
                    }}
                  >
                    {row.archetype.split(" (")[0]?.replace(/^The /, "") ?? row.archetype}
                  </div>
                </div>
                <div style={{ display: "flex", fontSize: 14, color: "#8a7565" }}>
                  {`${row.adds} adds · ${row.drops} drops · $${row.faab_spent} FAAB`}
                </div>
                <div
                  style={{
                    display: "flex",
                    height: 14,
                    background: "#e5d6c4",
                    borderRadius: 4,
                    overflow: "hidden",
                    border: "2px solid #2d1f14",
                  }}
                >
                  <div style={{ display: "flex", width: `${faabBar}%`, background: color }} />
                </div>
              </div>
            );
          })}
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
          <div style={{ display: "flex", fontWeight: 700 }}>
            {`razzle.lol/league${league ? `/${league}` : ""}/waiver-tendencies`}
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
