/** Compact trade-finder payload for OG export — mirrors in-product Bureau panel. */

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
  hero_index?: number;
  needs?: string[];
  surplus?: string[];
};

type CompactPlayer = { id: string; n: string; p: string; v: number };
type CompactMatch = {
  id: number;
  tm: string;
  g: CompactPlayer;
  t: CompactPlayer;
  gp: number;
};
type CompactTradeFinder = {
  m: CompactMatch[];
  hi?: number;
  nd?: string[];
  sp?: string[];
};

function hasSnapshotData(snap: BureauTradeFinderOgSnapshot): boolean {
  return snap.matches?.length > 0 && Boolean(snap.matches[0]?.partner_team);
}

function fromCompact(c: CompactTradeFinder): BureauTradeFinderOgSnapshot | null {
  const matches = (c.m ?? [])
    .map((row) => ({
      partner_roster_id: row.id,
      partner_team: row.tm,
      give: {
        player_id: row.g.id,
        name: row.g.n,
        position: row.g.p,
        dynasty_value: row.g.v,
      },
      get: {
        player_id: row.t.id,
        name: row.t.n,
        position: row.t.p,
        dynasty_value: row.t.v,
      },
      value_gap: Math.abs(row.g.v - row.t.v),
      gap_pct: row.gp,
    }))
    .filter((m) => m.partner_team && m.give.name && m.get.name);
  if (!matches.length) return null;
  return {
    matches,
    hero_index: c.hi,
    needs: c.nd,
    surplus: c.sp,
  };
}

function toCompact(snap: BureauTradeFinderOgSnapshot): CompactTradeFinder {
  return {
    m: snap.matches.slice(0, 3).map((row) => ({
      id: row.partner_roster_id,
      tm: row.partner_team,
      g: {
        id: row.give.player_id,
        n: row.give.name,
        p: row.give.position,
        v: row.give.dynasty_value,
      },
      t: {
        id: row.get.player_id,
        n: row.get.name,
        p: row.get.position,
        v: row.get.dynasty_value,
      },
      gp: row.gap_pct,
    })),
    hi: snap.hero_index,
    nd: snap.needs?.length ? snap.needs : undefined,
    sp: snap.surplus?.length ? snap.surplus : undefined,
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
    return fromCompact(JSON.parse(json) as CompactTradeFinder);
  } catch {
    return null;
  }
}
