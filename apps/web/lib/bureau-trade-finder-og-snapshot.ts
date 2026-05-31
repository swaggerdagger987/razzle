/** Compact Trade Finder payload for OG export — mirrors in-product Bureau tab. */

export type TradeFinderOgPlayer = {
  player_id: string;
  name: string;
  position: string;
  dynasty_value: number;
};

export type TradeFinderOgMatch = {
  partner_roster_id: number;
  partner_team: string;
  give: TradeFinderOgPlayer;
  get: TradeFinderOgPlayer;
  value_gap: number;
  gap_pct: number;
};

export interface BureauTradeFinderOgSnapshot {
  matches: TradeFinderOgMatch[];
  hero_match?: TradeFinderOgMatch | null;
  needs?: string[];
  surplus?: string[];
}

type CompactPlayer = { i: string; n: string; p: string; v: number };
type CompactMatch = {
  r: number;
  t: string;
  g: CompactPlayer;
  a: CompactPlayer;
  gp: number;
};
type CompactSnap = {
  m: CompactMatch[];
  h?: number;
  n?: string[];
  s?: string[];
};

function toCompactPlayer(p: TradeFinderOgPlayer): CompactPlayer {
  return { i: p.player_id, n: p.name, p: p.position, v: p.dynasty_value };
}

function fromCompactPlayer(c: CompactPlayer): TradeFinderOgPlayer {
  return { player_id: c.i, name: c.n, position: c.p, dynasty_value: c.v };
}

function toCompactMatch(m: TradeFinderOgMatch): CompactMatch {
  return {
    r: m.partner_roster_id,
    t: m.partner_team,
    g: toCompactPlayer(m.give),
    a: toCompactPlayer(m.get),
    gp: m.gap_pct,
  };
}

function fromCompactMatch(c: CompactMatch): TradeFinderOgMatch {
  const give = fromCompactPlayer(c.g);
  const get = fromCompactPlayer(c.a);
  return {
    partner_roster_id: c.r,
    partner_team: c.t,
    give,
    get,
    value_gap: Math.abs(give.dynasty_value - get.dynasty_value),
    gap_pct: c.gp,
  };
}

export function encodeBureauTradeFinderOgSnapshot(
  snap: BureauTradeFinderOgSnapshot,
): string | undefined {
  if (!snap.matches?.length) return undefined;
  const compact: CompactSnap = {
    m: snap.matches.slice(0, 3).map(toCompactMatch),
    n: snap.needs?.length ? snap.needs : undefined,
    s: snap.surplus?.length ? snap.surplus : undefined,
  };
  const heroIdx = snap.hero_match
    ? compact.m.findIndex((m) => m.r === snap.hero_match!.partner_roster_id)
    : 0;
  if (heroIdx >= 0) compact.h = heroIdx;
  const json = JSON.stringify(compact);
  if (typeof btoa === "function") {
    return btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  return undefined;
}

export function decodeBureauTradeFinderOgSnapshot(param: string): BureauTradeFinderOgSnapshot | null {
  try {
    const b64 = param.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(b64);
    const c = JSON.parse(json) as CompactSnap;
    if (!c.m?.length) return null;
    const matches = c.m.map(fromCompactMatch);
    const hero = c.h != null && c.h >= 0 ? matches[c.h] : matches[0];
    return { matches, hero_match: hero, needs: c.n, surplus: c.s };
  } catch {
    return null;
  }
}
