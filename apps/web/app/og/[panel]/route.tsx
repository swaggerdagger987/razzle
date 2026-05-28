import { ImageResponse } from "next/og";
import { getPanel } from "@razzle/panels";
import { agentForPanel, AGENT_BY_ID } from "@razzle/agents";

export const runtime = "edge";

const POS_COLOR: Record<string, string> = {
  QB: "#5b7fff",
  RB: "#2ec4b6",
  WR: "#d97757",
  TE: "#8b5cf6",
};

interface OgRow {
  name: string;
  position: string;
  team: string;
  stat: number;
  statLabel: string;
}

const STAT_KEYS_BY_SLUG: Record<string, { key: string; label: string }> = {
  rankings: { key: "dynasty_value", label: "Value" },
  tradevalues: { key: "dynasty_value", label: "Value" },
  breakouts: { key: "rbs_score", label: "RBS" },
  weekly: { key: "ppg", label: "PPG" },
  prospects: { key: "rps", label: "RPS" },
  gamelog: { key: "fantasy_points_ppr", label: "FPTS" },
  efficiency: { key: "ppo", label: "PPO" },
  aging: { key: "ppg", label: "PPG" },
  buysell: { key: "efficiency_grade", label: "Grade" },
  dashboard: { key: "dynasty_value", label: "Value" },
  leaders: { key: "fantasy_points_ppr", label: "FPTS" },
  vorp: { key: "vorp", label: "VORP" },
  consistency: { key: "ppg", label: "PPG" },
  tiers: { key: "dynasty_value", label: "Value" },
};

const FALLBACK_STAT = { key: "fantasy_points_ppr", label: "FPTS" };

function extractRows(data: Record<string, unknown>, slug: string): OgRow[] {
  const statDef = STAT_KEYS_BY_SLUG[slug] ?? FALLBACK_STAT;

  const arrays: unknown[][] = [];
  if (Array.isArray(data.players)) arrays.push(data.players);
  if (Array.isArray(data.candidates)) arrays.push(data.candidates);
  if (Array.isArray(data.items)) arrays.push(data.items);
  if (Array.isArray(data.rows)) arrays.push(data.rows);
  if (Array.isArray(data.data)) arrays.push(data.data);

  if (slug === "buysell") {
    const buyLow = Array.isArray(data.buy_low) ? data.buy_low : [];
    const sellHigh = Array.isArray(data.sell_high) ? data.sell_high : [];
    arrays.push([...buyLow.slice(0, 3), ...sellHigh.slice(0, 3)]);
  }

  if (slug === "dashboard") {
    const topPlayers = Array.isArray(data.top_players) ? data.top_players : [];
    arrays.push(topPlayers);
  }

  const source = arrays.find((arr) => arr.length > 0) ?? [];

  return source.slice(0, 5).map((item) => {
    const row = item as Record<string, unknown>;
    const name = String(row.full_name ?? row.name ?? row.player_name ?? "");
    const position = String(row.position ?? row.pos ?? "");
    const team = String(row.team ?? row.team_abbr ?? "");

    let stat = Number(row[statDef.key] ?? 0);
    if (!stat || isNaN(stat)) {
      stat = Number(
        row.ppg ?? row.fantasy_points_ppr ?? row.dynasty_value ?? row.value ?? 0,
      );
    }

    return { name, position, team, stat, statLabel: statDef.label };
  });
}

async function fetchPanelRows(slug: string): Promise<OgRow[]> {
  const apiOrigin = process.env.NEXT_PUBLIC_API_ORIGIN || "http://127.0.0.1:8000";
  try {
    const res = await fetch(`${apiOrigin}/api/panels/${slug}?limit=10`, {
      headers: { "x-dev-tier": "pro" },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as Record<string, unknown>;
    return extractRows(data, slug);
  } catch {
    return [];
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ panel: string }> },
) {
  const { panel: slug } = await params;
  const url = new URL(req.url);
  const isDownload = url.searchParams.get("download") === "1";
  const query = url.searchParams.get("q") ?? "";

  const panel = getPanel(slug);
  if (!panel) {
    return new Response("panel not found", { status: 404 });
  }

  const agent = agentForPanel(slug) ?? AGENT_BY_ID.razzle;
  const rows = await fetchPanelRows(slug);
  const hasRows = rows.length > 0;
  const colHeader = hasRows ? rows[0]!.statLabel : "";

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
          padding: hasRows ? 48 : 60,
          fontFamily: "Space Mono",
          border: hasRows ? "10px solid #2d1f14" : "12px solid #2d1f14",
          boxShadow: hasRows ? undefined : "16px 16px 0 #2d1f14",
        }}
      >
        {/* Header */}
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
              background: "#f7efe5",
              border: "2px solid #2d1f14",
              borderRadius: 20,
              padding: "4px 14px",
              fontSize: 20,
            }}
          >
            <span style={{ display: "flex" }}>{agent.emoji}</span>
            <span style={{ display: "flex", fontWeight: 600 }}>{agent.name}</span>
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontFamily: "Luckiest Guy",
            fontSize: hasRows ? 56 : 96,
            lineHeight: 1.05,
            color: "#2d1f14",
            marginBottom: hasRows ? 4 : 24,
            maxWidth: 1000,
          }}
        >
          {panel.title}
        </div>

        <div
          style={{
            fontSize: hasRows ? 20 : 32,
            color: "#5c4a3d",
            marginBottom: hasRows ? 16 : 36,
            maxWidth: 1000,
          }}
        >
          {panel.blurb}
        </div>

        {/* Query annotation (if present) */}
        {query && !hasRows && (
          <div
            style={{
              fontFamily: "Caveat",
              fontSize: 36,
              color: "#d97757",
              padding: "8px 20px",
              alignSelf: "flex-start",
              border: "3px solid #2d1f14",
              borderRadius: 12,
              background: "#f7efe5",
              boxShadow: "6px 6px 0 #2d1f14",
              transform: "rotate(-1.5deg)",
              display: "flex",
            }}
          >
            "{query}"
          </div>
        )}

        {/* Data rows */}
        {hasRows ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              flex: 1,
              background: "#f7efe5",
              border: "3px solid #2d1f14",
              borderRadius: 8,
              padding: "10px 16px",
              boxShadow: "4px 4px 0 #2d1f14",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 15,
                color: "#8a7565",
                paddingBottom: 6,
                borderBottom: "2px dashed #c4b5a5",
              }}
            >
              <div style={{ width: 36, display: "flex" }}>#</div>
              <div style={{ flex: 1, display: "flex" }}>Player</div>
              <div style={{ width: 56, display: "flex" }}>Pos</div>
              <div style={{ width: 72, display: "flex" }}>Team</div>
              <div style={{ width: 80, textAlign: "right", display: "flex", justifyContent: "flex-end" }}>
                {colHeader}
              </div>
            </div>
            {rows.map((p, i) => (
              <div
                key={`${p.name}-${i}`}
                style={{ display: "flex", alignItems: "center", fontSize: 20 }}
              >
                <div style={{ width: 36, color: "#8a7565", display: "flex" }}>{i + 1}</div>
                <div style={{ flex: 1, fontWeight: 600, overflow: "hidden", display: "flex" }}>
                  {p.name.length > 22 ? `${p.name.slice(0, 20)}…` : p.name}
                </div>
                <div style={{ width: 56, display: "flex" }}>
                  <span
                    style={{
                      background: POS_COLOR[p.position] ?? "#5c4a3d",
                      color: "#f7efe5",
                      padding: "2px 8px",
                      borderRadius: 4,
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    {p.position}
                  </span>
                </div>
                <div style={{ width: 72, fontSize: 16, color: "#5c4a3d", display: "flex" }}>
                  {p.team}
                </div>
                <div
                  style={{
                    width: 80,
                    textAlign: "right",
                    fontWeight: 700,
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  {p.stat % 1 === 0 ? p.stat : p.stat.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ flex: 1, display: "flex" }} />
        )}

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 22,
            color: "#5c4a3d",
            marginTop: hasRows ? 12 : 0,
          }}
        >
          <div style={{ display: "flex" }}>razzle.lol/lab/{slug}</div>
          {isDownload ? (
            <div style={{ display: "flex", fontFamily: "Caveat", fontSize: 32, color: "#d97757" }}>
              made with 🐯 razzle.lol
            </div>
          ) : null}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
