import { ImageResponse } from "next/og";
import { getPanel } from "@razzle/panels";

export const runtime = "edge";

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
          padding: 60,
          fontFamily: "Space Mono",
          border: "12px solid #2d1f14",
          boxShadow: "16px 16px 0 #2d1f14",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 28 }}>
          <div style={{ fontSize: 72, display: "flex" }}>🐯</div>
          <div style={{ display: "flex", fontSize: 52, fontWeight: 700 }}>
            Razzle<span style={{ color: "#d97757" }}>.lol</span>
          </div>
        </div>

        <div
          style={{
            fontFamily: "Luckiest Guy",
            fontSize: 96,
            lineHeight: 1.05,
            color: "#2d1f14",
            marginBottom: 24,
            maxWidth: 1000,
          }}
        >
          {panel.title}
        </div>

        <div style={{ fontSize: 32, color: "#5c4a3d", marginBottom: 36, maxWidth: 1000 }}>
          {panel.blurb}
        </div>

        {query && (
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
            }}
          >
            “{query}”
          </div>
        )}

        <div style={{ flex: 1, display: "flex" }} />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 28,
            color: "#5c4a3d",
          }}
        >
          <div style={{ display: "flex" }}>razzle.lol/lab/{slug}</div>
          {isDownload ? (
            <div style={{ display: "flex", fontFamily: "Caveat", fontSize: 40, color: "#d97757" }}>
              made with 🐯 razzle.lol
            </div>
          ) : null}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
