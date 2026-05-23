import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const isDownload = url.searchParams.get("download") === "1";
  const universe = url.searchParams.get("universe") ?? "nfl";
  const sort = url.searchParams.get("sort") ?? "fantasy_points_ppr";
  const q = url.searchParams.get("q") ?? "";
  const pos = url.searchParams.get("pos") ?? "";

  const title = universe === "college" ? "College Screener" : "Dynasty Screener";
  const subtitle = [pos && `${pos} only`, sort.replace(/_/g, " "), q && `"${q}"`].filter(Boolean).join(" · ");

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
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 28 }}>
          <div style={{ fontSize: 72 }}>🐯</div>
          <div style={{ fontSize: 52, fontWeight: 700 }}>
            Razzle<span style={{ color: "#d97757" }}>.lol</span>
          </div>
        </div>
        <div style={{ fontFamily: "Luckiest Guy", fontSize: 88, marginBottom: 16 }}>{title}</div>
        <div style={{ fontSize: 28, color: "#5c4a3d", marginBottom: 24 }}>{subtitle || "filter any stat · build any view"}</div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#5c4a3d" }}>
          <div>razzle.lol/explore</div>
          {isDownload && (
            <div style={{ fontFamily: "Caveat", fontSize: 38, color: "#d97757" }}>made with 🐯 razzle.lol</div>
          )}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
