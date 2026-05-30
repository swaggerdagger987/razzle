import { ImageResponse } from "next/og";
import { getPanel } from "@razzle/panels";
import { agentForPanel } from "@razzle/agents";

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

const STAT_CANDIDATE_KEYS = [
  "fantasy_points_ppr",
  "dynasty_value",
  "trade_value",
  "value",
  "ppg",
  "fpts",
  "score",
  "composite_score",
  "efficiency_score",
  "breakout_score",
  "total_yards",
  "pts",
  "rank",
] as const;

function extractRows(data: unknown): OgRow[] {
  if (!data || typeof data !== "object") return [];

  const obj = data as Record<string, unknown>;
  let candidates: Record<string, unknown>[] = [];

  if (Array.isArray(obj.items)) {
    candidates = obj.items as Record<string, unknown>[];
  } else if (Array.isArray(obj.tiers)) {
    for (const tier of obj.tiers as Record<string, unknown>[]) {
      if (Array.isArray(tier.players)) {
        candidates.push(...(tier.players as Record<string, unknown>[]));
      }
    }
  } else if (Array.isArray(obj.players)) {
    candidates = obj.players as Record<string, unknown>[];
  } else if (Array.isArray(obj.buy) || Array.isArray(obj.sell)) {
    const buy = Array.isArray(obj.buy) ? (obj.buy as Record<string, unknown>[]) : [];
    const sell = Array.isArray(obj.sell) ? (obj.sell as Record<string, unknown>[]) : [];
    candidates = [...buy, ...sell];
  } else if (Array.isArray(obj.data)) {
    candidates = obj.data as Record<string, unknown>[];
  } else if (Array.isArray(obj.rankings)) {
    candidates = obj.rankings as Record<string, unknown>[];
  } else if (Array.isArray(data)) {
    candidates = data as Record<string, unknown>[];
  }

  if (candidates.length === 0) return [];

  let statKey = "";
  let statLabel = "";
  for (const k of STAT_CANDIDATE_KEYS) {
    if (candidates[0] && k in candidates[0] && candidates[0][k] != null) {
      statKey = k;
      statLabel = k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      if (k === "fantasy_points_ppr") statLabel = "FPTS";
      if (k === "ppg") statLabel = "PPG";
      if (k === "dynasty_value" || k === "trade_value" || k === "value") statLabel = "Value";
      break;
    }
  }

  return candidates.slice(0, 6).map((row) => ({
    name: String(row.full_name ?? row.name ?? row.player_name ?? ""),
    position: String(row.position ?? row.pos ?? ""),
    team: String(row.team ?? row.team_abbr ?? ""),
    stat: statKey ? Number(row[statKey] ?? 0) : 0,
    statLabel,
  }));
}

async function fetchPanelData(
  slug: string,
  apiPath: string,
  method: string,
  params?: Record<string, unknown>,
): Promise<OgRow[]> {
  const apiOrigin = process.env.NEXT_PUBLIC_API_ORIGIN || "http://127.0.0.1:8000";

  try {
    let res: Response;
    if (method === "POST") {
      res = await fetch(`${apiOrigin}${apiPath}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 6, ...(params ?? {}) }),
      });
    } else {
      const url = new URL(`${apiOrigin}${apiPath}`);
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          if (v != null) url.searchParams.set(k, String(v));
        }
      }
      url.searchParams.set("limit", "6");
      res = await fetch(url.toString());
    }
    if (!res.ok) return [];
    const data = await res.json();
    return extractRows(data);
  } catch {
    return [];
  }
}

function formatStat(n: number): string {
  if (n === 0) return "—";
  if (Number.isInteger(n)) return n.toLocaleString();
  return n.toFixed(1);
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

  const agent = agentForPanel(slug);
  const agentEmoji = agent?.emoji ?? "🐯";
  const agentName = agent?.name ?? "Razzle";

  const apiPath = panel.api.path.includes("{") ? "" : panel.api.path;
  const rows = apiPath
    ? await fetchPanelData(slug, apiPath, panel.api.method, panel.api.params as Record<string, unknown>)
    : [];

  const hasRows = rows.length > 0 && rows.some((r) => r.name);
  const colHeader = hasRows ? (rows[0]?.statLabel ?? "") : "";

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
              fontSize: 20,
              color: "#5c4a3d",
              background: "#f7efe5",
              padding: "4px 14px",
              border: "2px solid #2d1f14",
              borderRadius: 8,
            }}
          >
            <span style={{ fontSize: 24 }}>{agentEmoji}</span>
            <span>{agentName}</span>
          </div>
        </div>

        {/* Title + blurb */}
        <div
          style={{
            fontFamily: "Luckiest Guy",
            fontSize: hasRows ? 48 : 72,
            lineHeight: 1.1,
            marginBottom: 6,
            maxWidth: 1000,
          }}
        >
          {panel.title}
        </div>
        <div style={{ fontSize: 20, color: "#5c4a3d", marginBottom: 16, maxWidth: 1000 }}>
          {panel.blurb}
        </div>

        {query && (
          <div
            style={{
              fontFamily: "Caveat",
              fontSize: 28,
              color: "#d97757",
              padding: "4px 14px",
              alignSelf: "flex-start",
              border: "3px solid #2d1f14",
              borderRadius: 10,
              background: "#f7efe5",
              boxShadow: "4px 4px 0 #2d1f14",
              transform: "rotate(-1.5deg)",
              marginBottom: 12,
            }}
          >
            &ldquo;{query}&rdquo;
          </div>
        )}

        {/* Data rows */}
        {hasRows ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 5,
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
                fontSize: 14,
                color: "#8a7565",
                paddingBottom: 5,
                borderBottom: "2px dashed #c4b5a5",
              }}
            >
              <div style={{ width: 32, display: "flex" }}>#</div>
              <div style={{ flex: 1, display: "flex" }}>Player</div>
              <div style={{ width: 52, display: "flex" }}>Pos</div>
              <div style={{ width: 64, display: "flex" }}>Team</div>
              {colHeader && (
                <div style={{ width: 80, textAlign: "right", display: "flex", justifyContent: "flex-end" }}>
                  {colHeader}
                </div>
              )}
            </div>
            {rows.filter((r) => r.name).map((r, i) => (
              <div
                key={`${r.name}-${i}`}
                style={{ display: "flex", alignItems: "center", fontSize: 18 }}
              >
                <div style={{ width: 32, color: "#8a7565", display: "flex" }}>{i + 1}</div>
                <div style={{ flex: 1, fontWeight: 600, overflow: "hidden", display: "flex" }}>
                  {r.name.length > 22 ? `${r.name.slice(0, 20)}…` : r.name}
                </div>
                <div style={{ width: 52, display: "flex" }}>
                  {r.position && (
                    <span
                      style={{
                        background: POS_COLOR[r.position] ?? "#5c4a3d",
                        color: "#f7efe5",
                        padding: "1px 7px",
                        borderRadius: 4,
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {r.position}
                    </span>
                  )}
                </div>
                <div style={{ width: 64, fontSize: 15, color: "#5c4a3d", display: "flex" }}>{r.team}</div>
                {colHeader && (
                  <div style={{ width: 80, textAlign: "right", fontWeight: 700, display: "flex", justifyContent: "flex-end" }}>
                    {formatStat(r.stat)}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ fontSize: 64, display: "flex" }}>{panel.icon}</div>
            <div style={{ fontSize: 24, color: "#5c4a3d", display: "flex" }}>
              {agent?.loadingCopy ?? "pulling film..."}
            </div>
          </div>
        )}

        {/* Footer */}
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
          <div style={{ display: "flex" }}>razzle.lol/lab/{slug}</div>
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
