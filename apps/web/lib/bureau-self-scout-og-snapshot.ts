/** Compact Self-Scout payload for OG export — mirrors in-product Bureau Self-Scout panel. */

export interface SelfScoutDepthRow {
  position: string;
  grade: string;
  count: number;
  elite: number;
  topName: string;
}

export interface BureauSelfScoutOgSnapshot {
  team: string;
  record: string;
  league?: string;
  season?: string;
  archetype?: string;
  rank?: number;
  total?: number;
  depth: SelfScoutDepthRow[];
}

type PosBlock = {
  count?: number;
  elite?: number;
  depth?: Array<{ name?: string; dynasty_value?: number | null }>;
};

type CompactSelfScout = {
  t: string;
  r: string;
  l?: string;
  s?: string;
  a?: string;
  rk?: number;
  tot?: number;
  d: { p: string; g: string; c: number; e: number; top?: string }[];
};

const POS_ORDER = ["QB", "RB", "WR", "TE"] as const;

function depthGrade(block: PosBlock): string {
  const count = block.count ?? 0;
  const elite = block.elite ?? 0;
  if (count === 0) return "F";
  if (elite >= 2 || (elite >= 1 && count >= 4)) return "A";
  if (elite >= 1 || count >= 3) return "B";
  if (count >= 2) return "C";
  return "D";
}

function hasSnapshotData(snap: BureauSelfScoutOgSnapshot): boolean {
  return Boolean(snap.team && snap.depth.length > 0);
}

function fromCompact(c: CompactSelfScout): BureauSelfScoutOgSnapshot | null {
  if (!c?.t || !Array.isArray(c.d) || c.d.length === 0) return null;
  const snap: BureauSelfScoutOgSnapshot = {
    team: c.t,
    record: c.r ?? "",
    league: c.l,
    season: c.s,
    archetype: c.a,
    rank: c.rk,
    total: c.tot,
    depth: c.d.map((row) => ({
      position: row.p,
      grade: row.g,
      count: row.c,
      elite: row.e,
      topName: row.top ?? "—",
    })),
  };
  return hasSnapshotData(snap) ? snap : null;
}

/** Build snapshot from Bureau Self-Scout API payload shape. */
export function selfScoutOgSnapshotFromData(data: Record<string, unknown>): BureauSelfScoutOgSnapshot | null {
  const team = data.team as Record<string, unknown> | undefined;
  const league = data.league as Record<string, unknown> | undefined;
  const build = data.build_profile as Record<string, unknown> | undefined;
  const rank = data.power_rank as Record<string, unknown> | undefined;
  const depthMap = (data.depth as Record<string, PosBlock>) ?? {};
  const teamName = String(team?.name ?? "");
  if (!teamName) return null;

  const depth: SelfScoutDepthRow[] = POS_ORDER.map((pos) => {
    const block = depthMap[pos] ?? {};
    const top = [...(block.depth ?? [])].sort(
      (a, b) => (b.dynasty_value ?? 0) - (a.dynasty_value ?? 0),
    )[0];
    return {
      position: pos,
      grade: depthGrade(block),
      count: block.count ?? 0,
      elite: block.elite ?? 0,
      topName: top?.name ?? "—",
    };
  });

  return {
    team: teamName,
    record: String(team?.record ?? ""),
    league: league?.name ? String(league.name) : undefined,
    season: league?.season != null ? String(league.season) : undefined,
    archetype: build?.archetype ? String(build.archetype) : undefined,
    rank: typeof rank?.rank === "number" ? rank.rank : undefined,
    total: typeof rank?.total === "number" ? rank.total : undefined,
    depth,
  };
}

/** Base64url JSON for `snapshot` query param on `/og/self-scout`. */
export function encodeBureauSelfScoutOgSnapshot(snap: BureauSelfScoutOgSnapshot): string | undefined {
  if (!hasSnapshotData(snap)) return undefined;
  const compact: CompactSelfScout = {
    t: snap.team,
    r: snap.record,
    l: snap.league,
    s: snap.season,
    a: snap.archetype,
    rk: snap.rank,
    tot: snap.total,
    d: snap.depth.map((row) => ({
      p: row.position,
      g: row.grade,
      c: row.count,
      e: row.elite,
      top: row.topName !== "—" ? row.topName : undefined,
    })),
  };
  const json = JSON.stringify(compact);
  if (typeof btoa === "function") {
    return btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  return undefined;
}

/** Decode `snapshot` query param from Bureau Self-Scout export. */
export function decodeBureauSelfScoutOgSnapshot(param: string): BureauSelfScoutOgSnapshot | null {
  try {
    const b64 = param.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(b64);
    return fromCompact(JSON.parse(json) as CompactSelfScout);
  } catch {
    return null;
  }
}
