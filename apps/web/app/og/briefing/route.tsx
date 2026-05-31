import { ImageResponse } from "next/og";
import { AGENT_BY_ID } from "@razzle/agents";
import { toRoom } from "@razzle/hallway";
import type { Urgency } from "@razzle/types";

export const runtime = "edge";

const URGENCY_ACCENT: Record<Urgency, string> = {
  URGENT: "#c45c4a",
  MONITOR: "#d97757",
  OPPORTUNITY: "#2ec4b6",
  ROUTINE: "#5c4a3d",
};

/** Sample briefing for OG when no query snapshot (FACTORY-DOD Gate C). */
const DEMO = {
  question: "Trade CeeDee for Ja'Marr + a 2026 1st?",
  urgency: "URGENT" as Urgency,
  specialists: ["Hawkeye", "Bones"],
  briefing:
    "You're buying peak WR youth at a premium. Ja'Marr's target share is elite, but the 1st is mid — push for a 2026 2nd instead. If they won't budge, counter with a pick swap and keep Lamb for the playoff push.",
};

function clip(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function parseUrgency(raw: string | null): Urgency {
  const u = (raw ?? "ROUTINE").toUpperCase();
  if (u === "URGENT" || u === "MONITOR" || u === "OPPORTUNITY" || u === "ROUTINE") return u;
  return "ROUTINE";
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const isDownload = url.searchParams.get("download") === "1";
  const question = url.searchParams.get("question")?.trim() ?? "";
  const briefing = url.searchParams.get("briefing")?.trim() ?? "";
  const urgency = parseUrgency(url.searchParams.get("urgency"));
  const specialistsRaw = url.searchParams.get("specialists")?.trim() ?? "";
  const specialists = specialistsRaw
    ? specialistsRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const isLive = Boolean(question && briefing);
  const data = isLive
    ? { question, briefing, urgency, specialists }
    : DEMO;

  const razzle = AGENT_BY_ID.razzle;
  const accent = URGENCY_ACCENT[data.urgency];
  const body = clip(data.briefing, 520);
  const roomPath = toRoom({
    agentId: "razzle",
    question: clip(data.question, 120),
    panelSlug: "situation-room",
  });

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
            <span style={{ fontSize: 24 }}>{razzle.emoji}</span>
            <span>{razzle.name}</span>
          </div>
        </div>

        <div style={{ fontFamily: "Luckiest Guy", fontSize: 52, lineHeight: 1.1, marginBottom: 4 }}>
          Situation Room
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <span
            style={{
              display: "flex",
              fontSize: 16,
              fontWeight: 700,
              color: "#f7efe5",
              background: isLive ? "#2ec4b6" : "#d97757",
              padding: "4px 12px",
              border: "2px solid #2d1f14",
              borderRadius: 6,
            }}
          >
            {isLive ? "LIVE · your briefing" : "SAMPLE · trade readout"}
          </span>
          <span style={{ display: "flex", fontSize: 20, color: "#5c4a3d" }}>
            {isLive ? "briefing export · live card" : "briefing export · sample preview"}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            background: "#f7efe5",
            border: "3px solid #2d1f14",
            borderRadius: 8,
            padding: "16px 20px",
            boxShadow: "4px 4px 0 #2d1f14",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                display: "flex",
                fontSize: 16,
                fontWeight: 700,
                color: "#f7efe5",
                background: accent,
                padding: "4px 12px",
                border: "2px solid #2d1f14",
                borderRadius: 6,
              }}
            >
              {data.urgency}
            </span>
            {data.specialists.length > 0 ? (
              <span style={{ display: "flex", fontSize: 18, color: "#5c4a3d" }}>
                {data.specialists.join(" · ")}
              </span>
            ) : null}
          </div>
          <div style={{ display: "flex", fontSize: 22, fontWeight: 700, lineHeight: 1.3 }}>
            {clip(data.question, 140)}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 19,
              lineHeight: 1.45,
              color: "#2d1f14",
              whiteSpace: "pre-wrap",
            }}
          >
            {body}
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 18, color: "#d97757", marginTop: 12 }}>
          {`razzle.lol${roomPath} · continue in the Room`}
        </div>

        {/* Always-on terracotta watermark band — matches Explore + Bureau OG (T6 screenshot gravity) */}
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
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ display: "flex", fontWeight: 700 }}>{`razzle.lol${roomPath}`}</div>
            <div style={{ display: "flex", fontSize: 16, fontFamily: "Caveat" }}>
              Situation Room · continue the thread
            </div>
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
