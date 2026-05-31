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

type CompactPlayer = { id: string; n: string; p: string; dv: number };
type CompactMatch = {
  pr: number;
  pt: string;
  g: CompactPlayer;
  t: CompactPlayer;
  gp: number;
};
type CompactTradeFinder = {
  m: CompactMatch[];
  h?: number;
  n?: string[];
  s?: string[];
};

function hasSnapshotData(snap: BureauTradeFinderOgSnapshot): boolean {
  return snap.matches?.length > 0 && Boolean(snap.matches[0]?.give?.name);
}

function playerFromCompact(c: CompactPlayer): BureauTradeFinderOgPlayer {
  return {
    player_id: c.id,
    name: c.n,
    position: c.p,
    dynasty_value: c.dv,
  };
}

function matchFromCompact(c: CompactMatch): BureauTradeFinderOgMatch {
  return {
    partner_roster_id: c.pr,
    partner_team: c.pt,
    give: playerFromCompact(c.g),
    get: playerFromCompact(c.t),
    value_gap: Math.abs(c.g.dv - c.t.dv),
    gap_pct: c.gp,
  };
}

function fromCompact(c: CompactTradeFinder): BureauTradeFinderOgSnapshot | null {
  const matches = (c.m ?? []).map(matchFromCompact).filter((m) => m.give.name && m.get.name);
  if (!matches.length) return null;
  const heroIdx = typeof c.h === "number" && c.h >= 0 && c.h < matches.length ? c.h : 0;
  const snap: BureauTradeFinderOgSnapshot = {
    matches,
    hero_match: matches[heroIdx] ?? matches[0],
    needs: c.n ?? [],
    surplus: c.s ?? [],
  };
  return hasSnapshotData(snap) ? snap : null;
}

function toCompact(snap: BureauTradeFinderOgSnapshot): CompactTradeFinder {
  const hero = snap.hero_match ?? snap.matches[0];
  const heroIdx = hero
    ? snap.matches.findIndex(
        (m) =>
          m.partner_roster_id === hero.partner_roster_id &&
          m.give.player_id === hero.give.player_id,
      )
    : 0;
  return {
    m: snap.matches.slice(0, 6).map((row) => ({
      pr: row.partner_roster_id,
      pt: row.partner_team,
      g: {
        id: row.give.player_id,
        n: row.give.name,
        p: row.give.position,
        dv: row.give.dynasty_value,
      },
      t: {
        id: row.get.player_id,
        n: row.get.name,
        p: row.get.position,
        dv: row.get.dynasty_value,
      },
      gp: row.gap_pct,
    })),
    h: heroIdx >= 0 ? heroIdx : 0,
    n: snap.needs?.length ? snap.needs : undefined,
    s: snap.surplus?.length ? snap.surplus : undefined,
  };
}

export function encodeBureauTradeFinderOgSnapshot(
  snap: BureauTradeFinderOgSnapshot,
): string | undefined {
  if (!hasSnapshotData(snap)) return undefined;
  const json = JSON.stringify(toCompact(snap));
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
): {
  matches: BureauTradeFinderOgMatch[];
  hero_match: BureauTradeFinderOgMatch | null;
  needs: string[];
  surplus: string[];
} {
  const hero = snap.hero_match ?? snap.matches[0] ?? null;
  return {
    matches: snap.matches,
    hero_match: hero,
    needs: snap.needs ?? [],
    surplus: snap.surplus ?? [],
  };
}
