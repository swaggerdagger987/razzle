import { ImageResponse } from "next/og";
import { AGENTS, type AgentId } from "@razzle/agents";

export const runtime = "edge";

const VALID_AGENTS = new Set(AGENTS.map((a) => a.id));

export async function GET(req: Request) {
  const url = new URL(req.url);
  const isDownload = url.searchParams.get("download") === "1";
  const agentParam = url.searchParams.get("agent") ?? "razzle";
  const q = url.searchParams.get("q") ?? "";
  const highlightId = VALID_AGENTS.has(agentParam as AgentId) ? (agentParam as AgentId) : "razzle";
  const highlight = AGENTS.find((a) => a.id === highlightId) ?? AGENTS[0]!;

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
        </div>

        <div
          style={{
            display: "flex",
            fontFamily: "Luckiest Guy",
            fontSize: 52,
            lineHeight: 1.1,
            marginBottom: 8,
          }}
        >
          Situation Room
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 20,
            color: "#5c4a3d",
            marginBottom: 16,
            maxWidth: 1000,
          }}
        >
          six specialists on the floor · league context in every briefing
          {q ? ` · "${q}"` : ""}
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            flex: 1,
            alignContent: "flex-start",
          }}
        >
          {AGENTS.map((agent) => {
            const active = agent.id === highlightId;
            return (
              <div
                key={agent.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: 340,
                  padding: "12px 14px",
                  background: active ? "#f7efe5" : "#ede0cf",
                  border: active ? "4px solid #d97757" : "3px solid #2d1f14",
                  borderRadius: 8,
                  boxShadow: active ? "6px 6px 0 #2d1f14" : "4px 4px 0 #2d1f14",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 32, display: "flex" }}>{agent.emoji}</span>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: 22, fontWeight: 700 }}>{agent.name}</span>
                    <span style={{ fontSize: 14, color: "#5c4a3d" }}>{agent.role}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", fontSize: 18, color: "#d97757", marginTop: 8 }}>
          {`razzle.lol/room?agent=${highlight.id} · ask ${highlight.name}`}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 14,
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
