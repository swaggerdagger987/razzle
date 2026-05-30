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
  label: string;
  position?: string;
  team?: string;
  stat?: string;
}

function extractRows(data: unknown): OgRow[] {
  if (!data || typeof data !== "object") return [];
  const obj = data as Record<string, unknown>;

  const candidates: Record<string, unknown>[] = [];

  if (Array.isArray(obj.items)) candidates.push(...obj.items);
  else if (Array.isArray(obj.players)) candidates.push(...obj.players);
  else if (Array.isArray(obj.prospects)) candidates.push(...obj.prospects);
  else if (Array.isArray(obj.tiers)) {
    for (const tier of obj.tiers as Record<string, unknown>[]) {
      if (Array.isArray(tier.players)) candidates.push(...tier.players);
      else if (Array.isArray(tier.items)) candidates.push(...tier.items);
    }
  } else if (Array.isArray(obj.data)) candidates.push(...obj.data);
  else if (Array.isArray(obj.results)) candidates.push(...obj.results);
  else if (Array.isArray(obj.rows)) candidates.push(...obj.rows);
  else if (Array.isArray(obj.rankings)) candidates.push(...obj.rankings);

  return candidates.slice(0, 5).map((row) => {
    const label =
      String(row.full_name ?? row.player_name ?? row.name ?? row.label ?? row.player ?? "");
    const position = String(row.position ?? row.pos ?? "");
    const team = String(row.team ?? row.team_abbr ?? "");

    const statKeys = [
      "value", "score", "fantasy_points_ppr", "dynasty_value",
      "trade_value", "total_yards", "ppg", "points", "rating",
      "grade", "fpts", "rank", "tier",
    ];
    let stat = "";
    for (const key of statKeys) {
      if (row[key] !== undefined && row[key] !== null) {
        const val = Number(row[key]);
        stat = Number.isFinite(val)
          ? (val % 1 === 0 ? String(val) : val.toFixed(1))
          : String(row[key]);
        break;
      }
    }

    return { label, position: position || undefined, team: team || undefined, stat: stat || undefined };
  }).filter((r) => r.label);
}

async function fetchPanelData(
  apiPath: string,
  method: string,
  params?: Record<string, unknown>,
): Promise<unknown> {
  const apiOrigin = process.env.NEXT_PUBLIC_API_ORIGIN || "http://127.0.0.1:8000";
  const url = `${apiOrigin}${apiPath}`;

  try {
    if (method === "POST") {
      const body = params ?? {};
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, limit: 5 }),
      });
      if (!res.ok) return null;
      return await res.json();
    }
    const qs = params
      ? "?" + new URLSearchParams(
          Object.entries(params).map(([k, v]) => [k, String(v)])
        ).toString()
      : "";
    const res = await fetch(`${url}${qs}`, { method: "GET" });
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
  const data = await fetchPanelData(panel.api.path, panel.api.method, panel.api.params as Record<string, unknown> | undefined);
  const rows = extractRows(data);

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

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div style={{ fontFamily: "Luckiest Guy", fontSize: 56, display: "flex" }}>
            {panel.title}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <div style={{ fontSize: 28, display: "flex" }}>{agent.emoji}</div>
          <div style={{ fontSize: 20, color: "#5c4a3d", display: "flex" }}>
            {agent.name} · {agent.role}
          </div>
        </div>

        {query && (
          <div
            style={{
              fontFamily: "Caveat",
              fontSize: 28,
              color: "#d97757",
              padding: "6px 14px",
              alignSelf: "flex-start",
              border: "3px solid #2d1f14",
              borderRadius: 8,
              background: "#f7efe5",
              boxShadow: "4px 4px 0 #2d1f14",
              transform: "rotate(-1.5deg)",
              marginBottom: 14,
              display: "flex",
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
              padding: "12px 16px",
              boxShadow: "4px 4px 0 #2d1f14",
            }}
          >
            {rows.map((r, i) => (
              <div
                key={`${r.label}-${i}`}
                style={{ display: "flex", alignItems: "center", fontSize: 22 }}
              >
                <div style={{ width: 32, color: "#8a7565", display: "flex" }}>{i + 1}</div>
                <div style={{ flex: 1, fontWeight: 600, overflow: "hidden", display: "flex" }}>
                  {r.label.length > 20 ? `${r.label.slice(0, 18)}…` : r.label}
                </div>
                {r.position && (
                  <div style={{ width: 52, display: "flex" }}>
                    <span
                      style={{
                        background: POS_COLOR[r.position] ?? "#5c4a3d",
                        color: "#f7efe5",
                        padding: "2px 6px",
                        borderRadius: 4,
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {r.position}
                    </span>
                  </div>
                )}
                {r.team && (
                  <div style={{ width: 60, fontSize: 16, color: "#5c4a3d", display: "flex" }}>
                    {r.team}
                  </div>
                )}
                {r.stat && (
                  <div style={{ width: 72, textAlign: "right", fontWeight: 700, display: "flex", justifyContent: "flex-end" }}>
                    {r.stat}
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
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "#f7efe5",
              border: "3px solid #2d1f14",
              borderRadius: 8,
              padding: "24px",
              boxShadow: "4px 4px 0 #2d1f14",
            }}
          >
            <div style={{ fontSize: 64, marginBottom: 12, display: "flex" }}>{panel.icon}</div>
            <div style={{ fontSize: 22, color: "#5c4a3d", fontStyle: "italic", display: "flex" }}>
              {agent.loadingCopy}
            </div>
          </div>
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
