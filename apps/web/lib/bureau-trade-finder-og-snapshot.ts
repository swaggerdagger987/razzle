/** Compact Trade Finder payload for OG export — mirrors Bureau Trade Finder panel. */

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

type CompactPlayer = { id: string; n: string; p: string; v: number };
type CompactMatch = {
  pid: number;
  pt: string;
  g: CompactPlayer;
  r: CompactPlayer;
  gap: number;
};
type CompactTF = { m: CompactMatch[]; n?: string[]; s?: string[]; h?: number };

function hasSnapshotData(snap: BureauTradeFinderOgSnapshot): boolean {
  return snap.matches?.length > 0 && Boolean(snap.matches[0]?.partner_team);
}

function fromCompact(c: CompactTF): BureauTradeFinderOgSnapshot | null {
  const matches = (c.m ?? [])
    .map((row) => ({
      partner_roster_id: row.pid,
      partner_team: row.pt,
      give: {
        player_id: row.g.id,
        name: row.g.n,
        position: row.g.p,
        dynasty_value: row.g.v,
      },
      get: {
        player_id: row.r.id,
        name: row.r.n,
        position: row.r.p,
        dynasty_value: row.r.v,
      },
      value_gap: Math.abs(row.g.v - row.r.v),
      gap_pct: row.gap,
    }))
    .filter((m) => m.partner_team && m.give.name && m.get.name);
  if (!matches.length) return null;
  const heroIdx = typeof c.h === "number" && c.h >= 0 && c.h < matches.length ? c.h : 0;
  return {
    matches: matches.slice(0, 3),
    hero_match: matches[heroIdx] ?? matches[0],
    needs: c.n,
    surplus: c.s,
  };
}

function toCompact(snap: BureauTradeFinderOgSnapshot): CompactTF {
  const matches = snap.matches.slice(0, 3);
  const hero = snap.hero_match ?? matches[0];
  const heroIdx = hero ? matches.findIndex((m) => m.partner_roster_id === hero.partner_roster_id) : 0;
  return {
    m: matches.map((row) => ({
      pid: row.partner_roster_id,
      pt: row.partner_team,
      g: {
        id: row.give.player_id,
        n: row.give.name,
        p: row.give.position,
        v: row.give.dynasty_value,
      },
      r: {
        id: row.get.player_id,
        n: row.get.name,
        p: row.get.position,
        v: row.get.dynasty_value,
      },
      gap: row.gap_pct,
    })),
    n: snap.needs?.length ? snap.needs : undefined,
    s: snap.surplus?.length ? snap.surplus : undefined,
    h: heroIdx >= 0 ? heroIdx : 0,
  };
}

/** Base64url JSON for `snapshot` query param on `/og/trade-finder`. */
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
    return fromCompact(JSON.parse(json) as CompactTF);
  } catch {
    return null;
  }
}
