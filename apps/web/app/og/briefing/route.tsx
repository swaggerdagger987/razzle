import { ImageResponse } from "next/og";
import { AGENT_BY_ID } from "@razzle/agents";
import type { Urgency } from "@razzle/types";

export const runtime = "edge";

const URGENCY_COLOR: Record<Urgency, string> = {
  URGENT: "#dc2626",
  MONITOR: "#d97757",
  OPPORTUNITY: "#2ec4b6",
  ROUTINE: "#5c4a3d",
};

const DEMO = {
  question: "Should I trade Ja'Marr Chase before the deadline?",
  urgency: "MONITOR" as Urgency,
  specialists: ["hawkeye", "bones", "octo"] as const,
  briefing:
    "Chase is still a top-12 dynasty WR — injury risk is priced in. Bones sees two win-now offers at 1.04+ value; Octo flags target share regression if Higgins spikes. Hold unless you get a premium RB1 or two early 2026 1sts.",
  crossLabel: "Dolphin: ankle monitor",
};

function clip(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function parseBriefing(req: Request) {
  const url = new URL(req.url);
  const question = url.searchParams.get("question")?.trim() || DEMO.question;
  const briefing = url.searchParams.get("briefing")?.trim() || DEMO.briefing;
  const urgency = (url.searchParams.get("urgency")?.toUpperCase() as Urgency) || DEMO.urgency;
  const validUrgency = urgency in URGENCY_COLOR ? urgency : DEMO.urgency;
  const specRaw = url.searchParams.get("specialists") ?? "";
  const specialists =
    specRaw.length > 0
      ? specRaw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
      : [...DEMO.specialists];
  const isDemo = !url.searchParams.get("question") && !url.searchParams.get("briefing");
  return { question, briefing, urgency: validUrgency, specialists, isDemo };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const isDownload = url.searchParams.get("download") === "1";
  const { question, briefing, urgency, specialists, isDemo } = parseBriefing(req);
  const razzle = AGENT_BY_ID.razzle;
  const urgencyColor = URGENCY_COLOR[urgency];
  const staffLabels = specialists
    .map((id) => AGENT_BY_ID[id as keyof typeof AGENT_BY_ID]?.name ?? id)
    .join(" · ");

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
              color: urgencyColor,
              background: "#f7efe5",
              padding: "6px 16px",
              border: "3px solid #2d1f14",
              borderRadius: 8,
              boxShadow: "4px 4px 0 #2d1f14",
              fontWeight: 700,
            }}
          >
            {urgency}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontFamily: "Luckiest Guy",
            fontSize: 52,
            lineHeight: 1.05,
            marginBottom: 8,
          }}
        >
          Situation Room Briefing
        </div>
        <div style={{ display: "flex", fontSize: 18, color: "#5c4a3d", marginBottom: 14 }}>
          {isDemo ? "sample rivalry readout · screenshot for Slack/Reddit" : "shared from your Room session"}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            background: "#f7efe5",
            border: "3px solid #2d1f14",
            borderRadius: 8,
            padding: "20px 24px",
            boxShadow: "4px 4px 0 #2d1f14",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", fontSize: 22, fontWeight: 700, lineHeight: 1.3 }}>
            {clip(question, 120)}
          </div>
          {staffLabels ? (
            <div style={{ display: "flex", fontSize: 16, color: "#8a7565" }}>
              {`Staff: ${staffLabels}`}
            </div>
          ) : null}
          <div style={{ display: "flex", fontSize: 20, lineHeight: 1.45, color: "#2d1f14" }}>
            {clip(briefing, 420)}
          </div>
          {isDemo ? (
            <div style={{ display: "flex", fontSize: 15, color: "#d97757", marginTop: 4 }}>
              {DEMO.crossLabel}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 18,
            color: "#5c4a3d",
            marginTop: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ display: "flex", fontSize: 28 }}>{razzle.emoji}</span>
            <span style={{ display: "flex" }}>razzle.lol/room</span>
          </div>
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
