/** Compact Self-Scout payload for OG export — mirrors in-product depth grades. */

export type BureauSelfScoutOgPos = {
  position: string;
  grade: string;
  score: number;
  count: number;
  elite: number;
  top_name: string;
};

export type BureauSelfScoutOgSnapshot = {
  team: string;
  record: string;
  league?: string;
  season?: string;
  archetype?: string;
  rank?: number;
  total?: number;
  positions: BureauSelfScoutOgPos[];
};

type CompactPos = {
  p: string;
  g: string;
  s: number;
  c: number;
  e: number;
  n: string;
};

type CompactSelfScout = {
  tm: string;
  rc: string;
  lg?: string;
  sn?: string;
  ar?: string;
  rk?: number;
  tt?: number;
  pos: CompactPos[];
};

function hasSnapshotData(snap: BureauSelfScoutOgSnapshot): boolean {
  return Boolean(snap.team) && snap.positions?.length > 0;
}

function fromCompact(c: CompactSelfScout): BureauSelfScoutOgSnapshot | null {
  const positions = (c.pos ?? [])
    .map((row) => ({
      position: row.p,
      grade: row.g,
      score: row.s,
      count: row.c,
      elite: row.e,
      top_name: row.n,
    }))
    .filter((row) => row.position);
  if (!positions.length || !c.tm) return null;
  return {
    team: c.tm,
    record: c.rc,
    league: c.lg,
    season: c.sn,
    archetype: c.ar,
    rank: c.rk,
    total: c.tt,
    positions,
  };
}

function toCompact(snap: BureauSelfScoutOgSnapshot): CompactSelfScout {
  return {
    tm: snap.team,
    rc: snap.record,
    lg: snap.league,
    sn: snap.season,
    ar: snap.archetype,
    rk: snap.rank,
    tt: snap.total,
    pos: snap.positions.slice(0, 4).map((row) => ({
      p: row.position,
      g: row.grade,
      s: row.score,
      c: row.count,
      e: row.elite,
      n: row.top_name.slice(0, 24),
    })),
  };
}

/** Base64url JSON for `snapshot` query param on `/og/self-scout`. */
export function encodeBureauSelfScoutOgSnapshot(
  snap: BureauSelfScoutOgSnapshot,
): string | undefined {
  if (!hasSnapshotData(snap)) return undefined;
  const json = JSON.stringify(toCompact(snap));
  if (typeof btoa === "function") {
    return btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  return undefined;
}

export function decodeBureauSelfScoutOgSnapshot(
  param: string,
): BureauSelfScoutOgSnapshot | null {
  try {
    const b64 = param.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(b64);
    return fromCompact(JSON.parse(json) as CompactSelfScout);
  } catch {
    return null;
  }
}
