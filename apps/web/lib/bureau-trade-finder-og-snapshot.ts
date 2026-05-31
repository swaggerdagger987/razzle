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

type CompactPlayer = { id: string; n: string; p: string; v: number };
type CompactMatch = {
  pr: number;
  pt: string;
  g: CompactPlayer;
  v: CompactPlayer;
  gap: number;
  pct: number;
};
type CompactTradeFinder = {
  m: CompactMatch[];
  h?: CompactMatch;
  n?: string[];
  s?: string[];
};

function hasSnapshotData(snap: BureauTradeFinderOgSnapshot): boolean {
  return snap.matches?.length > 0 && Boolean(snap.matches[0]?.give?.name);
}

function toPlayer(c: CompactPlayer): BureauTradeFinderOgPlayer {
  return {
    player_id: c.id,
    name: c.n,
    position: c.p,
    dynasty_value: c.v,
  };
}

function toMatch(c: CompactMatch): BureauTradeFinderOgMatch {
  return {
    partner_roster_id: c.pr,
    partner_team: c.pt,
    give: toPlayer(c.g),
    get: toPlayer(c.v),
    value_gap: c.gap,
    gap_pct: c.pct,
  };
}

function fromCompact(c: CompactTradeFinder): BureauTradeFinderOgSnapshot | null {
  if (!Array.isArray(c.m) || c.m.length === 0) return null;
  const matches = c.m.map(toMatch);
  const snap: BureauTradeFinderOgSnapshot = {
    matches,
    hero_match: c.h ? toMatch(c.h) : matches[0],
    needs: c.n ?? [],
    surplus: c.s ?? [],
  };
  return hasSnapshotData(snap) ? snap : null;
}

export function bureauTradeFinderOgSnapshotToData(
  snap: BureauTradeFinderOgSnapshot,
): Required<Pick<BureauTradeFinderOgSnapshot, "matches" | "hero_match" | "needs" | "surplus">> {
  const hero = snap.hero_match ?? snap.matches[0] ?? null;
  return {
    matches: snap.matches,
    hero_match: hero,
    needs: snap.needs ?? [],
    surplus: snap.surplus ?? [],
  };
}

/** Base64url JSON for `snapshot` query param on `/og/trade-finder`. */
export function encodeBureauTradeFinderOgSnapshot(
  snap: BureauTradeFinderOgSnapshot,
): string | undefined {
  if (!hasSnapshotData(snap)) return undefined;
  const compact: CompactTradeFinder = {
    m: snap.matches.map((row) => ({
      pr: row.partner_roster_id,
      pt: row.partner_team,
      g: {
        id: row.give.player_id,
        n: row.give.name,
        p: row.give.position,
        v: row.give.dynasty_value,
      },
      v: {
        id: row.get.player_id,
        n: row.get.name,
        p: row.get.position,
        v: row.get.dynasty_value,
      },
      gap: row.value_gap,
      pct: row.gap_pct,
    })),
    h: snap.hero_match
      ? {
          pr: snap.hero_match.partner_roster_id,
          pt: snap.hero_match.partner_team,
          g: {
            id: snap.hero_match.give.player_id,
            n: snap.hero_match.give.name,
            p: snap.hero_match.give.position,
            v: snap.hero_match.give.dynasty_value,
          },
          v: {
            id: snap.hero_match.get.player_id,
            n: snap.hero_match.get.name,
            p: snap.hero_match.get.position,
            v: snap.hero_match.get.dynasty_value,
          },
          gap: snap.hero_match.value_gap,
          pct: snap.hero_match.gap_pct,
        }
      : undefined,
    n: snap.needs,
    s: snap.surplus,
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

export function tradeFinderPanelToOgSnapshot(
  data: Record<string, unknown>,
): BureauTradeFinderOgSnapshot | undefined {
  const matches = (data.matches as BureauTradeFinderOgMatch[]) ?? [];
  if (!matches.length) return undefined;
  const hero = (data.hero_match as BureauTradeFinderOgMatch | null) ?? matches[0];
  return {
    matches,
    hero_match: hero,
    needs: (data.needs as string[]) ?? [],
    surplus: (data.surplus as string[]) ?? [],
  };
}
