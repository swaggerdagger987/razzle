/** Compact Trade Finder payload for OG export — mirrors in-product Bureau panel. */

export type TradeFinderPlayerRef = {
  player_id: string;
  name: string;
  position: string;
  dynasty_value: number;
};

export type TradeFinderMatch = {
  partner_roster_id: number;
  partner_team: string;
  give: TradeFinderPlayerRef;
  get: TradeFinderPlayerRef;
  value_gap: number;
  gap_pct: number;
};

export interface BureauTradeFinderOgSnapshot {
  matches: TradeFinderMatch[];
  hero_match?: TradeFinderMatch | null;
  needs?: string[];
  surplus?: string[];
}

type CompactPlayer = { id: string; n: string; p: string; v: number };
type CompactMatch = {
  pt: string;
  pr: number;
  g: CompactPlayer;
  t: CompactPlayer;
  gv: number;
  gp: number;
};
type CompactTF = {
  m: CompactMatch[];
  h?: number;
  nd?: string[];
  su?: string[];
};

function toCompactMatch(m: TradeFinderMatch): CompactMatch {
  return {
    pt: m.partner_team,
    pr: m.partner_roster_id,
    g: { id: m.give.player_id, n: m.give.name, p: m.give.position, v: m.give.dynasty_value },
    t: { id: m.get.player_id, n: m.get.name, p: m.get.position, v: m.get.dynasty_value },
    gv: m.value_gap,
    gp: m.gap_pct,
  };
}

function fromCompactMatch(c: CompactMatch): TradeFinderMatch {
  return {
    partner_team: c.pt,
    partner_roster_id: c.pr,
    give: { player_id: c.g.id, name: c.g.n, position: c.g.p, dynasty_value: c.g.v },
    get: { player_id: c.t.id, name: c.t.n, position: c.t.p, dynasty_value: c.t.v },
    value_gap: c.gv,
    gap_pct: c.gp,
  };
}

function hasSnapshotData(snap: BureauTradeFinderOgSnapshot): boolean {
  return snap.matches.length > 0 && Boolean(snap.matches[0]?.give?.name);
}

export function encodeBureauTradeFinderOgSnapshot(
  snap: BureauTradeFinderOgSnapshot,
): string | undefined {
  if (!hasSnapshotData(snap)) return undefined;
  const matches = snap.matches.slice(0, 3).map(toCompactMatch);
  const heroIdx = snap.hero_match
    ? matches.findIndex(
        (m) =>
          m.pr === snap.hero_match!.partner_roster_id &&
          m.g.id === snap.hero_match!.give.player_id,
      )
    : 0;
  const compact: CompactTF = {
    m: matches,
    h: heroIdx >= 0 ? heroIdx : undefined,
    nd: snap.needs?.length ? snap.needs : undefined,
    su: snap.surplus?.length ? snap.surplus : undefined,
  };
  const json = JSON.stringify(compact);
  if (typeof btoa !== "function") return undefined;
  return btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeBureauTradeFinderOgSnapshot(
  param: string,
): BureauTradeFinderOgSnapshot | null {
  try {
    const b64 = param.replace(/-/g, "+").replace(/_/g, "/");
    const parsed = JSON.parse(atob(b64)) as CompactTF;
    if (!parsed?.m?.length) return null;
    const matches = parsed.m.map(fromCompactMatch);
    const hero = parsed.h != null && parsed.h >= 0 ? matches[parsed.h] : matches[0];
    const snap: BureauTradeFinderOgSnapshot = {
      matches,
      hero_match: hero ?? null,
      needs: parsed.nd ?? [],
      surplus: parsed.su ?? [],
    };
    return hasSnapshotData(snap) ? snap : null;
  } catch {
    return null;
  }
}

export function bureauTradeFinderSnapshotToData(
  snap: BureauTradeFinderOgSnapshot,
): {
  matches: TradeFinderMatch[];
  hero_match: TradeFinderMatch | null;
  needs: string[];
  surplus: string[];
} {
  return {
    matches: snap.matches,
    hero_match: snap.hero_match ?? snap.matches[0] ?? null,
    needs: snap.needs ?? [],
    surplus: snap.surplus ?? [],
  };
}
