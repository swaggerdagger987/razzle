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
  id: number;
  t: string;
  g: CompactPlayer;
  r: CompactPlayer;
  gp: number;
};

type CompactTradeFinder = {
  m: CompactMatch[];
  nd?: string[];
  su?: string[];
};

function hasSnapshotData(snap: BureauTradeFinderOgSnapshot): boolean {
  return snap.matches?.length > 0 && Boolean(snap.matches[0]?.partner_team);
}

function fromCompact(c: CompactTradeFinder): BureauTradeFinderOgSnapshot | null {
  const matches = (c.m ?? [])
    .map((row) => ({
      partner_roster_id: row.id,
      partner_team: row.t,
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
      gap_pct: row.gp,
    }))
    .filter((m) => m.partner_team && m.give.name);
  if (!matches.length) return null;
  return {
    matches,
    hero_match: matches[0],
    needs: c.nd,
    surplus: c.su,
  };
}

function toCompact(snap: BureauTradeFinderOgSnapshot): CompactTradeFinder {
  const top = snap.matches.slice(0, 3);
  return {
    m: top.map((m) => ({
      id: m.partner_roster_id,
      t: m.partner_team,
      g: {
        id: m.give.player_id,
        n: m.give.name,
        p: m.give.position,
        v: m.give.dynasty_value,
      },
      r: {
        id: m.get.player_id,
        n: m.get.name,
        p: m.get.position,
        v: m.get.dynasty_value,
      },
      gp: m.gap_pct,
    })),
    nd: snap.needs?.length ? snap.needs : undefined,
    su: snap.surplus?.length ? snap.surplus : undefined,
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

export function tradeFinderDataToOgSnapshot(data: {
  matches?: BureauTradeFinderOgMatch[];
  hero_match?: BureauTradeFinderOgMatch | null;
  needs?: string[];
  surplus?: string[];
}): BureauTradeFinderOgSnapshot | null {
  const matches = data.matches ?? [];
  if (!matches.length) return null;
  return {
    matches,
    hero_match: data.hero_match ?? matches[0],
    needs: data.needs,
    surplus: data.surplus,
  };
}
