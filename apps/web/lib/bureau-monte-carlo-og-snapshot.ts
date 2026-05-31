/** Compact Monte Carlo odds payload for OG export — mirrors Bureau Monte Carlo panel. */

export type BureauMonteCarloOgRow = {
  roster_id: number;
  manager: string;
  championship_pct: number;
  playoff_pct: number;
  roster_power: number;
};

export type BureauMonteCarloOgSnapshot = {
  rows: BureauMonteCarloOgRow[];
};

type CompactRow = {
  id: number;
  m: string;
  cp: number;
  pp: number;
  rp: number;
};

type CompactMonte = { r: CompactRow[] };

function hasSnapshotData(snap: BureauMonteCarloOgSnapshot): boolean {
  return snap.rows?.length > 0 && Boolean(snap.rows[0]?.manager);
}

function fromCompact(c: CompactMonte): BureauMonteCarloOgSnapshot | null {
  const rows = (c.r ?? [])
    .map((row) => ({
      roster_id: row.id,
      manager: row.m,
      championship_pct: row.cp,
      playoff_pct: row.pp,
      roster_power: row.rp,
    }))
    .filter((row) => row.manager);
  if (!rows.length) return null;
  return { rows };
}

function toCompact(snap: BureauMonteCarloOgSnapshot): CompactMonte {
  return {
    r: snap.rows.slice(0, 3).map((row) => ({
      id: row.roster_id,
      m: row.manager,
      cp: row.championship_pct,
      pp: row.playoff_pct,
      rp: row.roster_power,
    })),
  };
}

export function encodeBureauMonteCarloOgSnapshot(
  snap: BureauMonteCarloOgSnapshot,
): string | undefined {
  if (!hasSnapshotData(snap)) return undefined;
  const json = JSON.stringify(toCompact(snap));
  if (typeof btoa === "function") {
    return btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  return undefined;
}

export function decodeBureauMonteCarloOgSnapshot(
  param: string,
): BureauMonteCarloOgSnapshot | null {
  try {
    const b64 = param.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(b64);
    return fromCompact(JSON.parse(json) as CompactMonte);
  } catch {
    return null;
  }
}
