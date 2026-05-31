/** Compact Trade Finder payload for OG export — mirrors in-panel Bureau view. */

export type TradeFinderOgMatch = {
  partner_team: string;
  give: { name: string; position: string; dynasty_value: number };
  get: { name: string; position: string; dynasty_value: number };
  gap_pct: number;
};

export type BureauTradeFinderOgSnapshot = {
  matches: TradeFinderOgMatch[];
  needs?: string[];
  surplus?: string[];
};

type CompactMatch = {
  t: string;
  g: { n: string; p: string; v: number };
  r: { n: string; p: string; v: number };
  gp: number;
};

type CompactSnap = {
  m: CompactMatch[];
  n?: string[];
  s?: string[];
};

function hasData(snap: BureauTradeFinderOgSnapshot): boolean {
  return snap.matches.length > 0 && Boolean(snap.matches[0]?.give?.name);
}

function fromCompact(c: CompactSnap): BureauTradeFinderOgSnapshot | null {
  if (!Array.isArray(c.m) || c.m.length === 0) return null;
  const matches: TradeFinderOgMatch[] = c.m.map((row) => ({
    partner_team: row.t,
    give: { name: row.g.n, position: row.g.p, dynasty_value: row.g.v },
    get: { name: row.r.n, position: row.r.p, dynasty_value: row.r.v },
    gap_pct: row.gp,
  }));
  const snap: BureauTradeFinderOgSnapshot = {
    matches,
    needs: c.n,
    surplus: c.s,
  };
  return hasData(snap) ? snap : null;
}

export function encodeBureauTradeFinderOgSnapshot(
  snap: BureauTradeFinderOgSnapshot,
): string | undefined {
  if (!hasData(snap)) return undefined;
  const compact: CompactSnap = {
    m: snap.matches.slice(0, 3).map((row) => ({
      t: row.partner_team,
      g: { n: row.give.name, p: row.give.position, v: row.give.dynasty_value },
      r: { n: row.get.name, p: row.get.position, v: row.get.dynasty_value },
      gp: row.gap_pct,
    })),
    n: snap.needs?.length ? snap.needs : undefined,
    s: snap.surplus?.length ? snap.surplus : undefined,
  };
  const json = JSON.stringify(compact);
  const b64 =
    typeof Buffer !== "undefined"
      ? Buffer.from(json, "utf8").toString("base64url")
      : btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return b64;
}

export function decodeBureauTradeFinderOgSnapshot(
  param: string,
): BureauTradeFinderOgSnapshot | null {
  if (!param.trim()) return null;
  try {
    const padded = param.replace(/-/g, "+").replace(/_/g, "/");
    const json =
      typeof Buffer !== "undefined"
        ? Buffer.from(padded, "base64").toString("utf8")
        : atob(padded);
    const c = JSON.parse(json) as CompactSnap;
    return fromCompact(c);
  } catch {
    return null;
  }
}
