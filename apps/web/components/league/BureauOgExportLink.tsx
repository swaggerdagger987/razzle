"use client";

export interface H2hSnapshotPayload {
  you: { team: string; record: string; ppg: number };
  them: { team: string; record: string; ppg: number };
  position_compare: { position: string; your_count: number; their_count: number }[];
  trade_fit?: { you_could_offer: string[]; you_could_target: string[] };
}

/** Compact base64url snapshot so OG card matches the in-product Bureau view. */
export function encodeH2hSnapshot(payload: H2hSnapshotPayload): string | undefined {
  if (!payload.you?.team || !payload.them?.team) return undefined;
  const compact = {
    y: payload.you,
    t: payload.them,
    pc: (payload.position_compare ?? []).slice(0, 6).map((row) => ({
      position: row.position,
      y: row.your_count,
      t: row.their_count,
    })),
    tf: payload.trade_fit
      ? {
          o: payload.trade_fit.you_could_offer ?? [],
          g: payload.trade_fit.you_could_target ?? [],
        }
      : undefined,
  };
  const json = JSON.stringify(compact);
  if (typeof btoa !== "function") return undefined;
  return btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeH2hSnapshot(encoded: string): H2hSnapshotPayload | null {
  try {
    const padded = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(padded);
    const raw = JSON.parse(json) as {
      y?: H2hSnapshotPayload["you"];
      t?: H2hSnapshotPayload["them"];
      pc?: H2hSnapshotPayload["position_compare"];
      tf?: { o?: string[]; g?: string[] };
    };
    if (!raw.y?.team || !raw.t?.team) return null;
    return {
      you: raw.y,
      them: raw.t,
      position_compare: raw.pc ?? [],
      trade_fit: raw.tf ? { you_could_offer: raw.tf.o ?? [], you_could_target: raw.tf.g ?? [] } : undefined,
    };
  } catch {
    return null;
  }
}

export function BureauOgExportLink({
  feature,
  leagueId,
  userId,
  opponentId,
  snapshot,
  downloadName = "razzle-head-to-head.png",
  label = "export card",
}: {
  feature: "head-to-head";
  leagueId: string;
  userId: string;
  opponentId?: string;
  snapshot?: H2hSnapshotPayload;
  downloadName?: string;
  label?: string;
}) {
  const params = new URLSearchParams({ download: "1", league: leagueId, user: userId });
  if (opponentId) params.set("opponent", opponentId);
  const snap = snapshot ? encodeH2hSnapshot(snapshot) : undefined;
  if (snap) params.set("snapshot", snap);
  return (
    <a
      href={`/og/${feature}?${params.toString()}`}
      className="btn-chunky active mt-3 inline-block text-xs"
      style={{ background: "var(--orange)", color: "var(--text-on-accent)" }}
      download={downloadName}
    >
      {label}
    </a>
  );
}
