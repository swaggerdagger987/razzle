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

