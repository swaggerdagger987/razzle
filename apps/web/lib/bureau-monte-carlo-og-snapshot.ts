/** Compact playoff-odds payload for OG export — mirrors Bureau Monte Carlo panel. */

export type BureauMonteCarloOgRow = {
  manager: string;
  championship_pct: number;
  playoff_pct: number;
  roster_power: number;
};

export type BureauMonteCarloOgSnapshot = {
  rows: BureauMonteCarloOgRow[];
};

type CompactRow = {
  m: string;
  c: number;
  p: number;
  r: number;
};

type CompactMonte = { o: CompactRow[] };

function hasSnapshotData(snap: BureauMonteCarloOgSnapshot): boolean {
  return snap.rows?.length > 0 && Boolean(snap.rows[0]?.manager);
}

function fromCompact(c: CompactMonte): BureauMonteCarloOgSnapshot | null {
  const rows = (c.o ?? [])
    .map((row) => ({
      manager: row.m,
      championship_pct: row.c,
      playoff_pct: row.p,
      roster_power: row.r,
    }))
    .filter((row) => row.manager);
  if (!rows.length) return null;
  return { rows };
}

function toCompact(snap: BureauMonteCarloOgSnapshot): CompactMonte {
  return {
    o: snap.rows.slice(0, 3).map((row) => ({
      m: row.manager,
      c: row.championship_pct,
      p: row.playoff_pct,
      r: row.roster_power,
    })),
  };
}

/** Base64url JSON for `snapshot` query param on `/og/monte-carlo`. */
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
