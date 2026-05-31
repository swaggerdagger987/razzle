import { ImageResponse } from "next/og";
import { AGENT_BY_ID } from "@razzle/agents";
import { toLeague } from "@razzle/hallway";
import { decodeBureauSelfScoutOgSnapshot } from "@/lib/bureau-self-scout-og-snapshot";

export const runtime = "edge";

type PosBlock = {
  count?: number;
  elite?: number;
  depth?: Array<{ name?: string; dynasty_value?: number | null }>;
};

type SelfScoutData = {
  team?: { name?: string; record?: string };
  league?: { name?: string; season?: string | number };
  depth?: Record<string, PosBlock>;
  build_profile?: { archetype?: string };
  power_rank?: { rank?: number; total?: number };
  error?: string;
};

const POS_ORDER = ["QB", "RB", "WR", "TE"] as const;

const POS_COLORS: Record<string, string> = {
  QB: "#5b7fff",
  RB: "#2ec4b6",
  WR: "#d97757",
  TE: "#8b5cf6",
};

const DEMO_DEPTH: Record<string, PosBlock> = {
  QB: { count: 2, elite: 1, depth: [{ name: "J. Burrow", dynasty_value: 82 }] },
  RB: { count: 4, elite: 2, depth: [{ name: "B. Robinson", dynasty_value: 91 }] },
  WR: { count: 5, elite: 1, depth: [{ name: "J. Chase", dynasty_value: 88 }] },
  TE: { count: 1, elite: 0, depth: [{ name: "S. LaPorta", dynasty_value: 54 }] },
};

const DEMO_META = {
  team: "Dynasty Dukes",
  record: "7-6-0",
  league: "Sunday Sweat",
  season: "2025",
  archetype: "Win Now",
  rank: 3,
  total: 12,
};

function depthGrade(block: PosBlock): string {
  const count = block.count ?? 0;
  const elite = block.elite ?? 0;
  if (count === 0) return "F";
  if (elite >= 2 || (elite >= 1 && count >= 4)) return "A";
  if (elite >= 1 || count >= 3) return "B";
  if (count >= 2) return "C";
  return "D";
}

function depthScore(block: PosBlock): number {
  const count = block.count ?? 0;
  const elite = block.elite ?? 0;
  const values = (block.depth ?? []).map((p) => p.dynasty_value ?? 0);
  const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  return Math.min(100, Math.round(elite * 25 + count * 12 + avg / 10));
}

/** Edge OG must hit same-origin `/api/*` so Next rewrites reach FastAPI (dev/preview/CI). */
function resolveApiOrigin(req: Request): string {
  return new URL(req.url).origin;
}

async function fetchSelfScout(
  req: Request,
  leagueId: string,
  userId: string,
): Promise<SelfScoutData | null> {
  if (!leagueId || !userId) return null;
  const apiOrigin = resolveApiOrigin(req);

  try {
    const res = await fetch(`${apiOrigin}/api/bureau/self-scout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ league_id: leagueId, user_id: userId }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as SelfScoutData;
    if (data.error || !data.depth) return null;
    return data;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const isDownload = url.searchParams.get("download") === "1";
  const league = url.searchParams.get("league") ?? "";
  const user = url.searchParams.get("user") ?? "";
  const snapshotParam = url.searchParams.get("snapshot") ?? "";
  const snapshot = snapshotParam ? decodeBureauSelfScoutOgSnapshot(snapshotParam) : null;

  const hawkeye = AGENT_BY_ID.hawkeye;
  const isSnapshot = Boolean(snapshot?.rows?.length);
  const live = isSnapshot ? null : await fetchSelfScout(req, league, user);
  const fromSnapshot = snapshot?.rows?.length ? snapshot : null;
  const isLive = !isSnapshot && Boolean(live?.depth && Object.keys(live.depth).length > 0);
  const isDemo = !isSnapshot && !isLive;
  const leagueDeepLink = league ? toLeague(league, "self-scout") : "/league/self-scout";
  const depth = isDemo ? DEMO_DEPTH : fromSnapshot ? null : live!.depth!;
  const teamName = fromSnapshot?.team ?? (isDemo ? DEMO_META.team : live!.team?.name ?? "Your Team");
  const record = fromSnapshot?.record ?? (isDemo ? DEMO_META.record : live!.team?.record ?? "");
  const leagueName = fromSnapshot?.league ?? (isDemo ? DEMO_META.league : live!.league?.name ?? "");
  const season = fromSnapshot?.season ?? (isDemo ? DEMO_META.season : String(live!.league?.season ?? ""));
  const archetype =
    fromSnapshot?.archetype ?? (isDemo ? DEMO_META.archetype : live!.build_profile?.archetype ?? "");
  const rank = fromSnapshot?.rank ?? (isDemo ? DEMO_META.rank : live!.power_rank?.rank ?? 0);
  const total = fromSnapshot?.total ?? (isDemo ? DEMO_META.total : live!.power_rank?.total ?? 0);
  const rows = fromSnapshot?.rows?.length
    ? fromSnapshot.rows.map((row) => ({
        pos: row.pos,
        grade: row.grade,
        score: row.score,
        count: row.count,
        elite: row.elite,
        topName: row.topName,
        color: POS_COLORS[row.pos] ?? "#5c4a3d",
      }))
    : POS_ORDER.map((pos) => {
        const block = depth![pos] ?? {};
        const top = [...(block.depth ?? [])].sort((a, b) => (b.dynasty_value ?? 0) - (a.dynasty_value ?? 0))[0];
        return {
          pos,
          grade: depthGrade(block),
          score: depthScore(block),
          count: block.count ?? 0,
          elite: block.elite ?? 0,
          topName: top?.name ?? "—",
          color: POS_COLORS[pos] ?? "#5c4a3d",
        };
      });

  const weakest = rows.reduce(
    (min, r) => (r.count < min.count ? r : min),
    rows[0]!,
  );

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
          Self-Scout
        </div>
        <div style={{ display: "flex", fontSize: 20, color: "#5c4a3d", marginBottom: 8 }}>
          {`${teamName} · ${record} · #${rank} of ${total}`}
          {isSnapshot ? " · exported from panel" : isDemo ? " · sample preview" : ""}
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
            EXPORTED · panel scout rows
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
            LIVE · Sleeper depth grades
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
            SAMPLE · demo depth preview
          </div>
        ) : null}

        {archetype ? (
          <div
            style={{
              display: "flex",
              fontFamily: "Caveat",
              fontSize: 28,
              color: "#d97757",
              marginBottom: 10,
            }}
          >
            {`${archetype} build — ${weakest.pos} is your thinnest spot. Screenshot for trade threads.`}
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            flex: 1,
            alignContent: "flex-start",
          }}
        >
          {rows.map((row) => (
            <div
              key={row.pos}
              style={{
                display: "flex",
                flexDirection: "column",
                width: "48%",
                background: "#f7efe5",
                border: "3px solid #2d1f14",
                borderRadius: 8,
                padding: "12px 14px",
                boxShadow: "4px 4px 0 #2d1f14",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div
                  style={{
                    display: "flex",
                    fontSize: 18,
                    fontWeight: 700,
                    color: row.color,
                    border: `2px solid ${row.color}`,
                    padding: "2px 10px",
                    borderRadius: 4,
                  }}
                >
                  {row.pos}
                </div>
                <div
                  style={{
                    display: "flex",
                    fontFamily: "Luckiest Guy",
                    fontSize: 40,
                    color: row.color,
                    transform: "rotate(-3deg)",
                  }}
                >
                  {row.grade}
                </div>
              </div>
              <div style={{ display: "flex", fontSize: 28, fontWeight: 700, marginTop: 6 }}>
                {row.score}
                <span style={{ display: "flex", fontSize: 16, color: "#8a7565", marginLeft: 4, marginTop: 10 }}>
                  /100
                </span>
              </div>
              <div style={{ display: "flex", fontSize: 14, color: "#5c4a3d" }}>
                {`${row.count} rostered · ${row.elite} elite`}
              </div>
              <div style={{ display: "flex", fontSize: 14, color: "#8a7565", marginTop: 4 }}>{row.topName}</div>
            </div>
          ))}
        </div>

        {/* Always-on watermark band — matches Monte Carlo + Trade Finder OG (T6 screenshot gravity) */}
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
