/** Compact SOS payload for OG export — mirrors in-product Bureau Schedule panel. */

export interface BureauSosOgSnapshot {
  verdict: string;
  your_ppg: number;
  opponent_avg_ppg: number;
  your_rank?: number | null;
  league_id?: string;
}

type CompactSos = {
  v: string;
  yp: number;
  op: number;
  rk?: number | null;
  lg?: string;
};

function hasSnapshotData(snap: BureauSosOgSnapshot): boolean {
  return Boolean(snap.verdict?.trim() && snap.your_ppg > 0);
}

function fromCompact(c: CompactSos): BureauSosOgSnapshot | null {
  if (!c?.v?.trim()) return null;
  return {
    verdict: c.v,
    your_ppg: Number(c.yp),
    opponent_avg_ppg: Number(c.op),
    your_rank: c.rk != null ? Number(c.rk) : null,
    league_id: c.lg,
  };
}

/** Base64url JSON for `snapshot` query param on `/og/strength-of-schedule`. */
export function encodeBureauSosOgSnapshot(snap: BureauSosOgSnapshot): string | undefined {
  if (!hasSnapshotData(snap)) return undefined;
  const compact: CompactSos = {
    v: snap.verdict.slice(0, 120),
    yp: Math.round(snap.your_ppg * 10) / 10,
    op: Math.round(snap.opponent_avg_ppg * 10) / 10,
    rk: snap.your_rank ?? undefined,
    lg: snap.league_id,
  };
  const json = JSON.stringify(compact);
  if (typeof btoa === "function") {
    return btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  return undefined;
}

export function decodeBureauSosOgSnapshot(param: string): BureauSosOgSnapshot | null {
  try {
    const b64 = param.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(b64);
    return fromCompact(JSON.parse(json) as CompactSos);
  } catch {
    return null;
  }
}
