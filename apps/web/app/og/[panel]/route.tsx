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

function extractRows(data: unknown, slug: string): OgRow[] {
  if (!data || typeof data !== "object") return [];
  const d = data as Record<string, unknown>;

  const candidateKeys = [
    "players",
    "candidates",
    "items",
    "rows",
    "data",
    "rankings",
    "values",
    "leaders",
    "results",
  ];

  let arr: Record<string, unknown>[] | undefined;
  for (const key of candidateKeys) {
    const val = d[key];
    if (Array.isArray(val) && val.length > 0) {
      arr = val as Record<string, unknown>[];
      break;
    }
  }

  if (!arr) {
    const tiersObj = d["tiers"] as Record<string, unknown> | undefined;
    if (tiersObj && typeof tiersObj === "object") {
      const tierPlayers = tiersObj["players"] as Record<string, unknown>[] | undefined;
      if (Array.isArray(tierPlayers) && tierPlayers.length > 0) {
        arr = tierPlayers;
      } else {
        for (const val of Object.values(tiersObj)) {
          if (Array.isArray(val) && val.length > 0) {
            arr = val as Record<string, unknown>[];
            break;
          }
        }
      }
    }
  }

  if (!arr) {
    if (Array.isArray(data)) {
      arr = data as Record<string, unknown>[];
    }
  }

  if (!arr || arr.length === 0) return [];

  return arr.slice(0, 5).map((row) => {
    const name = String(
      row.full_name ?? row.player_name ?? row.name ?? row.player ?? "",
    );
    const position = String(row.position ?? row.pos ?? "");
    const team = String(row.team ?? row.team_abbr ?? "");

    const statKeys = [
      "fantasy_points_ppr",
      "dynasty_value",
      "trade_value",
      "value",
      "score",
      "composite_score",
      "efficiency_score",
      "rbs",
      "ppg",
      "fpts",
      "total_points",
      "points",
      "yards",
      "total_yards",
      "ppo",
      "grade",
    ];

    let stat = 0;
    let statLabel = "Value";
    for (const k of statKeys) {
      if (row[k] !== undefined && row[k] !== null) {
        stat = Number(row[k]);
        statLabel = k
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
        if (k === "fantasy_points_ppr") statLabel = "FPTS";
        if (k === "dynasty_value" || k === "trade_value") statLabel = "Value";
        if (k === "ppg") statLabel = "PPG";
        if (k === "ppo") statLabel = "PPO";
        if (k === "rbs") statLabel = "RBS";
        break;
      }
    }

    return { name, position, team, stat, statLabel };
  });
}

async function fetchPanelData(
  apiPath: string,
  method: string,
  params?: Record<string, unknown>,
): Promise<unknown> {
  const apiOrigin =
    process.env.NEXT_PUBLIC_API_ORIGIN || "http://127.0.0.1:8000";

  try {
    let res: Response;
    if (method === "POST") {
      res = await fetch(`${apiOrigin}${apiPath}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params ?? {}),
      });
    } else {
      const url = new URL(`${apiOrigin}${apiPath}`);
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          url.searchParams.set(k, String(v));
        }
      }
      res = await fetch(url.toString());
    }
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
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

  const data = await fetchPanelData(
    panel.api.path,
    panel.api.method,
    panel.api.params as Record<string, unknown> | undefined,
  );
  const rows = extractRows(data, slug);
  const statCol = rows.length > 0 && rows[0] ? rows[0].statLabel : "Value";

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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 48, display: "flex" }}>🐯</div>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 700 }}>
            Razzle<span style={{ color: "#d97757" }}>.lol</span>
          </div>
          <div style={{ flex: 1, display: "flex" }} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 22,
              color: "#5c4a3d",
            }}
          >
            <span style={{ fontSize: 28 }}>{agent.emoji}</span>
            <span>{agent.name}</span>
          </div>
        </div>

        <div
          style={{
            fontFamily: "Luckiest Guy",
            fontSize: 52,
            lineHeight: 1.1,
            marginBottom: 6,
          }}
        >
          {panel.title}
        </div>
        <div
          style={{
            fontSize: 20,
            color: "#5c4a3d",
            marginBottom: rows.length > 0 ? 16 : 24,
            maxWidth: 900,
          }}
        >
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
              borderRadius: 12,
              background: "#f7efe5",
              boxShadow: "4px 4px 0 #2d1f14",
              transform: "rotate(-1.5deg)",
              marginBottom: 12,
            }}
          >
            &ldquo;{query}&rdquo;
          </div>
        )}

        {rows.length > 0 ? (
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
                fontSize: 14,
                color: "#8a7565",
                paddingBottom: 4,
                borderBottom: "2px dashed #c4b5a5",
              }}
            >
              <div style={{ width: 32, display: "flex" }}>#</div>
              <div style={{ flex: 1, display: "flex" }}>Player</div>
              <div style={{ width: 50, display: "flex" }}>Pos</div>
              <div style={{ width: 64, display: "flex" }}>Team</div>
              <div style={{ width: 80, display: "flex", justifyContent: "flex-end" }}>
                {statCol}
              </div>
            </div>
            {rows.map((r, i) => (
              <div
                key={`${r.name}-${i}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: 20,
                  lineHeight: 1.6,
                }}
              >
                <div
                  style={{ width: 32, color: "#8a7565", display: "flex" }}
                >
                  {i + 1}
                </div>
                <div
                  style={{
                    flex: 1,
                    fontWeight: 600,
                    overflow: "hidden",
                    display: "flex",
                  }}
                >
                  {r.name.length > 22 ? `${r.name.slice(0, 20)}…` : r.name}
                </div>
                <div style={{ width: 50, display: "flex" }}>
                  {r.position && (
                    <span
                      style={{
                        background: POS_COLOR[r.position] ?? "#5c4a3d",
                        color: "#f7efe5",
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {r.position}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    width: 64,
                    fontSize: 15,
                    color: "#5c4a3d",
                    display: "flex",
                  }}
                >
                  {r.team}
                </div>
                <div
                  style={{
                    width: 80,
                    fontWeight: 700,
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  {r.stat % 1 === 0
                    ? r.stat
                    : r.stat.toFixed(1)}
                </div>
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
              fontSize: 28,
              color: "#5c4a3d",
              fontFamily: "Caveat",
            }}
          >
            {agent.loadingCopy}
          </div>
        )}

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
            <div
              style={{
                display: "flex",
                fontFamily: "Caveat",
                fontSize: 28,
                color: "#d97757",
              }}
            >
              made with 🐯 razzle.lol
            </div>
          ) : null}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
