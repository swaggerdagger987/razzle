/** Compact Monte Carlo odds payload for OG export — mirrors Bureau panel top-3. */

export type BureauMonteCarloOgRow = {
  manager: string;
  championship_pct: number;
  playoff_pct: number;
  roster_power: number;
};

export type BureauMonteCarloOgSnapshot = {
  odds: BureauMonteCarloOgRow[];
};

type CompactOdds = { m: string; t: number; p: number; rp: number };
type CompactMc = { o: CompactOdds[] };

function hasSnapshotData(snap: BureauMonteCarloOgSnapshot): boolean {
  return snap.odds?.length > 0 && Boolean(snap.odds[0]?.manager);
}

function fromCompact(c: CompactMc): BureauMonteCarloOgSnapshot | null {
  const odds = (c.o ?? [])
    .map((row) => ({
      manager: row.m,
      championship_pct: row.t,
      playoff_pct: row.p,
      roster_power: row.rp,
    }))
    .filter((row) => row.manager);
  if (!odds.length) return null;
  return { odds };
}

function toCompact(snap: BureauMonteCarloOgSnapshot): CompactMc {
  return {
    o: snap.odds.slice(0, 3).map((row) => ({
      m: row.manager,
      t: row.championship_pct,
      p: row.playoff_pct,
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
    return fromCompact(JSON.parse(json) as CompactMc);
  } catch {
    return null;
  }
}
