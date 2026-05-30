import { ImageResponse } from "next/og";
import { getPanel } from "@razzle/panels";

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
  stat: string;
}

function extractRows(data: unknown, slug: string): OgRow[] {
  if (!data || typeof data !== "object") return [];
  const obj = data as Record<string, unknown>;

  // Panel responses have varying shapes — try common keys
  const candidates =
    (obj.players as unknown[]) ??
    (obj.candidates as unknown[]) ??
    (obj.items as unknown[]) ??
    (obj.rows as unknown[]) ??
    (obj.data as unknown[]) ??
    (obj.tiers as unknown[]);

  // If tiers-style (array of { players: [...] }), flatten
  let rows: unknown[] = [];
  if (Array.isArray(candidates)) {
    if (
      candidates.length > 0 &&
      typeof candidates[0] === "object" &&
      candidates[0] !== null &&
      "players" in (candidates[0] as Record<string, unknown>)
    ) {
      for (const tier of candidates) {
        const t = tier as Record<string, unknown>;
        if (Array.isArray(t.players)) {
          rows.push(...(t.players as unknown[]));
        }
      }
    } else {
      rows = candidates;
    }
  }

  if (rows.length === 0) return [];

  return rows.slice(0, 5).map((row) => {
    const r = row as Record<string, unknown>;
    const name = String(r.full_name ?? r.name ?? r.player_name ?? "");
    const position = String(r.position ?? r.pos ?? "");
    const team = String(r.team ?? r.team_abbr ?? "");

    // Pick the most relevant stat value depending on panel
    let stat = "";
    if (slug === "rankings" || slug === "tradevalues") {
      stat = r.dynasty_value != null ? String(Math.round(Number(r.dynasty_value))) : "";
    } else if (slug === "efficiency") {
      stat = r.ppo != null ? Number(r.ppo).toFixed(2) : "";
    } else if (slug === "breakouts") {
      stat = r.breakout_score != null ? Number(r.breakout_score).toFixed(1) : "";
    } else if (slug === "buysell") {
      stat = r.mismatch_score != null ? Number(r.mismatch_score).toFixed(1) : "";
    } else if (slug === "aging") {
      stat = r.ppg != null ? Number(r.ppg).toFixed(1) : "";
    } else {
      // Generic: try ppg, fantasy_points_ppr, value, score
      const val = r.ppg ?? r.fantasy_points_ppr ?? r.value ?? r.score ?? r.points ?? "";
      stat = val !== "" && val != null ? (Number(val) % 1 === 0 ? String(val) : Number(val).toFixed(1)) : "";
    }

    return { name, position, team, stat };
  }).filter((r) => r.name);
}

function statLabel(slug: string): string {
  switch (slug) {
    case "rankings":
    case "tradevalues":
      return "Value";
    case "efficiency":
      return "PPO";
    case "breakouts":
      return "Score";
    case "buysell":
      return "Mismatch";
    case "aging":
      return "PPG";
    case "weekly":
      return "FPTS";
    default:
      return "Stat";
  }
}

async function fetchPanelData(slug: string): Promise<OgRow[]> {
  const apiOrigin = process.env.NEXT_PUBLIC_API_ORIGIN || "http://127.0.0.1:8000";
  try {
    const res = await fetch(`${apiOrigin}/api/panels/${slug}?limit=5`, {
      headers: { "x-razzle-tier": "pro" },
    });
    if (!res.ok) return [];
    const data = await res.json();
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

  const rows = await fetchPanelData(slug);
  const colHeader = statLabel(slug);

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
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <div style={{ fontSize: 52, display: "flex" }}>🐯</div>
          <div style={{ display: "flex", fontSize: 38, fontWeight: 700 }}>
            Razzle<span style={{ color: "#d97757" }}>.lol</span>
          </div>
        </div>

        <div style={{ fontFamily: "Luckiest Guy", fontSize: 56, marginBottom: 8 }}>
          {panel.title}
        </div>
        <div style={{ fontSize: 22, color: "#5c4a3d", marginBottom: 20, maxWidth: 1000 }}>
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
              border: "2px solid #2d1f14",
              borderRadius: 8,
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
              gap: 6,
              flex: 1,
              background: "#f7efe5",
              border: "3px solid #2d1f14",
              borderRadius: 8,
              padding: "12px 16px",
              boxShadow: "4px 4px 0 #2d1f14",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 16,
                color: "#8a7565",
                paddingBottom: 6,
                borderBottom: "2px dashed #c4b5a5",
              }}
            >
              <div style={{ width: 36, display: "flex" }}>#</div>
              <div style={{ flex: 1, display: "flex" }}>Player</div>
              <div style={{ width: 56, display: "flex" }}>Pos</div>
              <div style={{ width: 72, display: "flex" }}>Team</div>
              <div style={{ width: 80, textAlign: "right", display: "flex" }}>{colHeader}</div>
            </div>
            {rows.map((r, i) => (
              <div
                key={`${r.name}-${i}`}
                style={{ display: "flex", alignItems: "center", fontSize: 20 }}
              >
                <div style={{ width: 36, color: "#8a7565", display: "flex" }}>{i + 1}</div>
                <div style={{ flex: 1, fontWeight: 600, overflow: "hidden", display: "flex" }}>
                  {r.name.length > 22 ? `${r.name.slice(0, 20)}…` : r.name}
                </div>
                <div style={{ width: 56, display: "flex" }}>
                  <span
                    style={{
                      background: POS_COLOR[r.position] ?? "#5c4a3d",
                      color: "#f7efe5",
                      padding: "2px 8px",
                      borderRadius: 4,
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    {r.position}
                  </span>
                </div>
                <div style={{ width: 72, fontSize: 16, color: "#5c4a3d", display: "flex" }}>
                  {r.team}
                </div>
                <div style={{ width: 80, textAlign: "right", fontWeight: 700, display: "flex" }}>
                  {r.stat}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ flex: 1, display: "flex" }} />
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 22,
            color: "#5c4a3d",
            marginTop: 16,
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
