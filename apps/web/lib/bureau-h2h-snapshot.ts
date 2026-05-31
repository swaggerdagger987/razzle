/** Compact H2H payload for OG export — mirrors in-product Bureau panel rows. */

export type H2hSnapshotTeam = { team: string; record: string; ppg: number };
export type H2hSnapshotPos = { position: string; your_count: number; their_count: number };

export type H2hSnapshotPayload = {
  you: H2hSnapshotTeam;
  them: H2hSnapshotTeam;
  position_compare: H2hSnapshotPos[];
  trade_fit: { you_could_offer: string[]; you_could_target: string[] };
};

type CompactH2h = {
  y: [string, string, number];
  t: [string, string, number];
  p: [string, number, number][];
  o: string[];
  w: string[];
};

function toBase64Url(json: string): string | undefined {
  if (typeof btoa !== "function") return undefined;
  return btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function encodeH2hSnapshot(payload: H2hSnapshotPayload): string | undefined {
  if (!payload.you?.team || !payload.them?.team) return undefined;
  const compact: CompactH2h = {
    y: [payload.you.team, payload.you.record, payload.you.ppg],
    t: [payload.them.team, payload.them.record, payload.them.ppg],
    p: (payload.position_compare ?? []).map((r) => [r.position, r.your_count, r.their_count]),
    o: payload.trade_fit?.you_could_offer ?? [],
    w: payload.trade_fit?.you_could_target ?? [],
  };
  return toBase64Url(JSON.stringify(compact));
}

export function decodeH2hSnapshot(param: string): H2hSnapshotPayload | null {
  if (!param) return null;
  try {
    const padded = param.replace(/-/g, "+").replace(/_/g, "/");
    const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
    if (typeof atob !== "function") return null;
    const json = atob(padded + pad);
    const c = JSON.parse(json) as CompactH2h;
    if (!c.y?.[0] || !c.t?.[0]) return null;
    return {
      you: { team: c.y[0], record: c.y[1], ppg: c.y[2] },
      them: { team: c.t[0], record: c.t[1], ppg: c.t[2] },
      position_compare: (c.p ?? []).map(([position, your_count, their_count]) => ({
        position,
        your_count,
        their_count,
      })),
      trade_fit: { you_could_offer: c.o ?? [], you_could_target: c.w ?? [] },
    };
  } catch {
    return null;
  }
}
