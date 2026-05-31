/** Compact Trade Finder payload for OG export — mirrors in-product Bureau panel. */

export type BureauTradeFinderOgPlayer = {
  player_id: string;
  name: string;
  position: string;
  dynasty_value: number;
};

export type BureauTradeFinderOgMatch = {
  partner_roster_id: number;
  partner_team: string;
  give: BureauTradeFinderOgPlayer;
  get: BureauTradeFinderOgPlayer;
  value_gap: number;
  gap_pct: number;
};

export type BureauTradeFinderOgSnapshot = {
  matches: BureauTradeFinderOgMatch[];
  hero_match?: BureauTradeFinderOgMatch | null;
  needs?: string[];
  surplus?: string[];
};

export type TradeFinderOgData = {
  matches?: BureauTradeFinderOgMatch[];
  hero_match?: BureauTradeFinderOgMatch | null;
  needs?: string[];
  surplus?: string[];
};

type CompactPlayer = { id: string; nm: string; pos: string; dv: number };
type CompactMatch = {
  pr: number;
  pt: string;
  gv: CompactPlayer;
  gt: CompactPlayer;
  gp: number;
};
type CompactTradeFinder = {
  m: CompactMatch[];
  h?: CompactMatch;
  n?: string[];
  s?: string[];
};

function compactPlayer(p: BureauTradeFinderOgPlayer): CompactPlayer {
  return { id: p.player_id, nm: p.name, pos: p.position, dv: p.dynasty_value };
}

function expandPlayer(p: CompactPlayer): BureauTradeFinderOgPlayer {
  return { player_id: p.id, name: p.nm, position: p.pos, dynasty_value: p.dv };
}

function compactMatch(m: BureauTradeFinderOgMatch): CompactMatch {
  return {
    pr: m.partner_roster_id,
    pt: m.partner_team,
    gv: compactPlayer(m.give),
    gt: compactPlayer(m.get),
    gp: m.gap_pct,
  };
}

function expandMatch(m: CompactMatch): BureauTradeFinderOgMatch {
  const valueGap = Math.abs(m.gv.dv - m.gt.dv);
  return {
    partner_roster_id: m.pr,
    partner_team: m.pt,
    give: expandPlayer(m.gv),
    get: expandPlayer(m.gt),
    value_gap: valueGap,
    gap_pct: m.gp,
  };
}

function hasSnapshotData(snap: BureauTradeFinderOgSnapshot): boolean {
  return snap.matches?.length > 0 && Boolean(snap.matches[0]?.partner_team);
}

function fromCompact(c: CompactTradeFinder): BureauTradeFinderOgSnapshot | null {
  const matches = (c.m ?? []).map(expandMatch).filter((m) => m.partner_team);
  if (!matches.length) return null;
  const hero = c.h ? expandMatch(c.h) : matches[0];
  return {
    matches,
    hero_match: hero,
    needs: c.n ?? [],
    surplus: c.s ?? [],
  };
}

/** Base64url JSON for `snapshot` query param on `/og/trade-finder`. */
export function encodeBureauTradeFinderOgSnapshot(
  snap: BureauTradeFinderOgSnapshot,
): string | undefined {
  if (!hasSnapshotData(snap)) return undefined;
  const hero = snap.hero_match ?? snap.matches[0];
  const compact: CompactTradeFinder = {
    m: snap.matches.slice(0, 5).map(compactMatch),
    h: hero ? compactMatch(hero) : undefined,
    n: snap.needs?.length ? snap.needs : undefined,
    s: snap.surplus?.length ? snap.surplus : undefined,
  };
  const json = JSON.stringify(compact);
  if (typeof btoa === "function") {
    return btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  return undefined;
}

export function decodeBureauTradeFinderOgSnapshot(
  param: string,
): BureauTradeFinderOgSnapshot | null {
  try {
    const b64 = param.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(b64);
    return fromCompact(JSON.parse(json) as CompactTradeFinder);
  } catch {
    return null;
  }
}

export function bureauTradeFinderOgSnapshotToData(
  snap: BureauTradeFinderOgSnapshot,
): TradeFinderOgData {
  return {
    matches: snap.matches,
    hero_match: snap.hero_match ?? snap.matches[0],
    needs: snap.needs ?? [],
    surplus: snap.surplus ?? [],
  };
}
