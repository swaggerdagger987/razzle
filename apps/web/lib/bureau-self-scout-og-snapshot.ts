/** Compact Self-Scout payload for OG export — mirrors Bureau Self-Scout panel grades. */

export type BureauSelfScoutOgPosRow = {
  pos: string;
  grade: string;
  score: number;
  count: number;
  elite: number;
  topName: string;
};

export type BureauSelfScoutOgSnapshot = {
  team: string;
  record: string;
  league: string;
  season: string;
  archetype: string;
  rank: number;
  total: number;
  rows: BureauSelfScoutOgPosRow[];
};

type CompactPos = { p: string; g: string; s: number; c: number; e: number; n: string };
type CompactScout = {
  tm: string;
  rc: string;
  lg: string;
  sn: string;
  ar: string;
  rk: number;
  tt: number;
  d: CompactPos[];
};

const POS_ORDER = ["QB", "RB", "WR", "TE"] as const;

function hasSnapshotData(snap: BureauSelfScoutOgSnapshot): boolean {
  return Boolean(snap.team) && snap.rows?.length > 0;
}

function fromCompact(c: CompactScout): BureauSelfScoutOgSnapshot | null {
  const rows = (c.d ?? [])
    .map((row) => ({
      pos: row.p,
      grade: row.g,
      score: row.s,
      count: row.c,
      elite: row.e,
      topName: row.n,
    }))
    .filter((row) => row.pos);
  if (!rows.length || !c.tm) return null;
  return {
    team: c.tm,
    record: c.rc ?? "",
    league: c.lg ?? "",
    season: c.sn ?? "",
    archetype: c.ar ?? "",
    rank: c.rk ?? 0,
    total: c.tt ?? 0,
    rows,
  };
}

function toCompact(snap: BureauSelfScoutOgSnapshot): CompactScout {
  return {
    tm: snap.team,
    rc: snap.record,
    lg: snap.league,
    sn: snap.season,
    ar: snap.archetype,
    rk: snap.rank,
    tt: snap.total,
    d: snap.rows
      .filter((row) => POS_ORDER.includes(row.pos as (typeof POS_ORDER)[number]))
      .map((row) => ({
        p: row.pos,
        g: row.grade,
        s: row.score,
        c: row.count,
        e: row.elite,
        n: row.topName.slice(0, 32),
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
    return fromCompact(JSON.parse(json) as CompactScout);
  } catch {
    return null;
  }
}
