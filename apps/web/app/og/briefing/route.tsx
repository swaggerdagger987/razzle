import { ImageResponse } from "next/og";
import { AGENT_BY_ID } from "@razzle/agents";
import type { Urgency } from "@razzle/types";
import {
  decodeRoomBriefingOgSnapshot,
  type RoomBriefingOgSnapshot,
} from "@/lib/room-briefing-og-snapshot";

export const runtime = "edge";

const URGENCY_COLOR: Record<Urgency, string> = {
  URGENT: "#ef4444",
  MONITOR: "#d97757",
  OPPORTUNITY: "#2ec4b6",
  ROUTINE: "#5c4a3d",
};

/** Sample staff verdict for OG preview when no snapshot (FACTORY-DOD Gate C). */
const DEMO_BRIEFING: RoomBriefingOgSnapshot = {
  question: "Should I sell high on my RB1 before the deadline?",
  urgency: "MONITOR",
  briefing:
    "Hold unless you land a top-12 WR. Your RB room covers six weeks — selling now trades a playoff ceiling for a marginal QB upgrade.",
  specialists: ["hawkeye", "bones", "razzle"],
};

function briefingExcerpt(text: string, max = 320): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const isDownload = url.searchParams.get("download") === "1";
  const snapshotParam = url.searchParams.get("snapshot") ?? "";

  const razzle = AGENT_BY_ID.razzle;
  const snapshot = snapshotParam ? decodeRoomBriefingOgSnapshot(snapshotParam) : null;
  const isSnapshot = Boolean(snapshot);
  const data: RoomBriefingOgSnapshot = snapshot ?? DEMO_BRIEFING;
  const urgency = data.urgency;
  const urgencyColor = URGENCY_COLOR[urgency] ?? URGENCY_COLOR.ROUTINE;
  const staffLine =
    data.specialists.length > 0
      ? data.specialists.map((id) => AGENT_BY_ID[id as keyof typeof AGENT_BY_ID]?.name ?? id).join(" · ")
      : "full staff";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#1a110a",
          color: "#f7efe5",
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
              color: "#f7efe5",
              background: "#2d1f14",
              padding: "4px 14px",
              border: "2px solid #d97757",
              borderRadius: 8,
            }}
          >
            <span style={{ fontSize: 24 }}>{razzle.emoji}</span>
            <span>{razzle.name}</span>
          </div>
        </div>

        <div style={{ fontFamily: "Luckiest Guy", fontSize: 52, lineHeight: 1.1, marginBottom: 4 }}>
          Situation Room
        </div>
        <div style={{ display: "flex", fontSize: 18, color: "#c4a882", marginBottom: 16 }}>
          {isSnapshot ? "staff briefing · exported verdict" : "staff briefing · sample preview"}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 16,
              fontWeight: 700,
              color: "#f7efe5",
              background: urgencyColor,
              padding: "6px 14px",
              border: "2px solid #2d1f14",
              borderRadius: 6,
            }}
          >
            {urgency}
          </div>
          <div style={{ display: "flex", fontSize: 16, color: "#c4a882" }}>{staffLine}</div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            gap: 12,
            background: "#2d1f14",
            border: "3px solid #d97757",
            borderRadius: 8,
            padding: "16px 20px",
            boxShadow: "4px 4px 0 #d97757",
          }}
        >
          <div style={{ display: "flex", fontFamily: "Caveat", fontSize: 28, color: "#d97757" }}>
            {data.question.length > 90 ? `${data.question.slice(0, 88)}…` : data.question}
          </div>
          <div style={{ display: "flex", fontSize: 22, lineHeight: 1.45, color: "#f7efe5" }}>
            {briefingExcerpt(data.briefing)}
          </div>
        </div>

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
          <div style={{ display: "flex", fontWeight: 700 }}>razzle.lol/room</div>
          <div style={{ display: "flex", fontFamily: "Caveat", fontSize: 30 }}>
            {`made with 🐯 razzle.lol${isDownload ? " · export" : ""}`}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
