/** Compact power-board payload for OG export — mirrors Bureau Power Rankings panel. */

export type BureauPowerRankingsOgRow = {
  rank: number;
  roster_id: number;
  team: string;
  record: string;
  ppg: number;
  opp_ppg: number;
  differential: number;
  expected_wins: number;
  luck: number;
};

export type BureauPowerRankingsOgSnapshot = {
  rows: BureauPowerRankingsOgRow[];
};

type CompactRow = {
  rk: number;
  id: number;
  tm: string;
  rc: string;
  pp: number;
  op: number;
  df: number;
  ew: number;
  lk: number;
};

type CompactPower = { r: CompactRow[] };

function hasSnapshotData(snap: BureauPowerRankingsOgSnapshot): boolean {
  return snap.rows?.length > 0 && Boolean(snap.rows[0]?.team);
}

function fromCompact(c: CompactPower): BureauPowerRankingsOgSnapshot | null {
  const rows = (c.r ?? [])
    .map((row) => ({
      rank: row.rk,
      roster_id: row.id,
      team: row.tm,
      record: row.rc,
      ppg: row.pp,
      opp_ppg: row.op,
      differential: row.df,
      expected_wins: row.ew,
      luck: row.lk,
    }))
    .filter((row) => row.team);
  if (!rows.length) return null;
  return { rows };
}

function toCompact(snap: BureauPowerRankingsOgSnapshot): CompactPower {
  return {
    r: snap.rows.slice(0, 5).map((row) => ({
      rk: row.rank,
      id: row.roster_id,
      tm: row.team,
      rc: row.record,
      pp: row.ppg,
      op: row.opp_ppg,
      df: row.differential,
      ew: row.expected_wins,
      lk: row.luck,
    })),
  };
}

/** Base64url JSON for `snapshot` query param on `/og/power-rankings`. */
export function encodeBureauPowerRankingsOgSnapshot(
  snap: BureauPowerRankingsOgSnapshot,
): string | undefined {
  if (!hasSnapshotData(snap)) return undefined;
  const json = JSON.stringify(toCompact(snap));
  if (typeof btoa === "function") {
    return btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  return undefined;
}

export function decodeBureauPowerRankingsOgSnapshot(
  param: string,
): BureauPowerRankingsOgSnapshot | null {
  try {
    const b64 = param.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(b64);
    return fromCompact(JSON.parse(json) as CompactPower);
  } catch {
    return null;
  }
}
