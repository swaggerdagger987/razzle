import { ImageResponse } from "next/og";
import { AGENT_BY_ID } from "@razzle/agents";

export const runtime = "edge";

const POS_COLOR: Record<string, string> = {
  QB: "#5b7fff",
  RB: "#2ec4b6",
  WR: "#d97757",
  TE: "#8b5cf6",
};

interface RankRow {
  rank: number;
  full_name: string;
  position: string;
  team: string;
  dynasty_value: number;
  tier_label: string;
}

/** Sample top-6 for OG preview when API/terminal.db unavailable (FACTORY-DOD Gate C). */
const DEMO_RANKINGS: RankRow[] = [
  { rank: 1, full_name: "Ja'Marr Chase", position: "WR", team: "CIN", dynasty_value: 98.2, tier_label: "Elite" },
  { rank: 2, full_name: "Bijan Robinson", position: "RB", team: "ATL", dynasty_value: 96.8, tier_label: "Elite" },
  { rank: 3, full_name: "Justin Jefferson", position: "WR", team: "MIN", dynasty_value: 95.1, tier_label: "Elite" },
  { rank: 4, full_name: "CeeDee Lamb", position: "WR", team: "DAL", dynasty_value: 93.4, tier_label: "Star" },
  { rank: 5, full_name: "Christian McCaffrey", position: "RB", team: "SF", dynasty_value: 91.0, tier_label: "Star" },
  { rank: 6, full_name: "Brock Bowers", position: "TE", team: "LV", dynasty_value: 88.5, tier_label: "Star" },
];

async function fetchRankings(limit = 6): Promise<RankRow[]> {
  const apiOrigin = process.env.NEXT_PUBLIC_API_ORIGIN || "http://127.0.0.1:8000";
  try {
    const res = await fetch(`${apiOrigin}/api/dynasty-rankings?limit=${limit}`);
    if (!res.ok) return [];
    const data = (await res.json()) as {
      players?: Array<Record<string, unknown>>;
    };
    const players = data.players ?? [];
    if (players.length === 0) return [];

    return players.slice(0, limit).map((p, i) => ({
      rank: i + 1,
      full_name: String(p.full_name ?? p.name ?? ""),
      position: String(p.position ?? ""),
      team: String(p.team ?? ""),
      dynasty_value: Number(p.dynasty_value ?? 0),
      tier_label: String(p.tier_label ?? p.tier ?? ""),
    }));
  } catch {
    return [];
  }
}

function formatValue(n: number): string {
  if (!n || Number.isNaN(n)) return "—";
  return n.toFixed(1);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const isDownload = url.searchParams.get("download") === "1";

  const octo = AGENT_BY_ID.octo;
  const live = await fetchRankings(6);
  const isDemo = live.length === 0 || !live.some((r) => r.full_name);
  const rows = isDemo ? DEMO_RANKINGS : live;

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
            <span style={{ fontSize: 24 }}>{octo.emoji}</span>
            <span>{octo.name}</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontFamily: "Luckiest Guy",
            fontSize: 56,
            lineHeight: 1.1,
            marginBottom: 4,
          }}
        >
          Dynasty Rankings
        </div>
        <div style={{ display: "flex", fontSize: 20, color: "#5c4a3d", marginBottom: 16 }}>
          {`trade-value tiers for win-now and rebuild alike${isDemo ? " · sample preview" : ""}`}
        </div>

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
            <div style={{ width: 72, display: "flex" }}>Tier</div>
            <div style={{ width: 72, textAlign: "right", display: "flex", justifyContent: "flex-end" }}>
              Value
            </div>
          </div>
          {rows.map((r) => (
            <div
              key={`${r.rank}-${r.full_name}`}
              style={{ display: "flex", alignItems: "center", fontSize: 18 }}
            >
              <div style={{ width: 32, color: "#8a7565", display: "flex" }}>{r.rank}</div>
              <div style={{ flex: 1, fontWeight: 600, display: "flex" }}>
                {r.full_name.length > 22 ? `${r.full_name.slice(0, 20)}…` : r.full_name}
              </div>
              <div style={{ width: 52, display: "flex" }}>
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
              </div>
              <div style={{ width: 64, fontSize: 15, color: "#5c4a3d", display: "flex" }}>{r.team}</div>
              <div style={{ width: 72, fontSize: 14, color: "#5c4a3d", display: "flex" }}>{r.tier_label}</div>
              <div
                style={{
                  width: 72,
                  textAlign: "right",
                  fontWeight: 700,
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                {formatValue(r.dynasty_value)}
              </div>
            </div>
          ))}
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
          <div style={{ display: "flex" }}>razzle.lol/lab/rankings</div>
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
