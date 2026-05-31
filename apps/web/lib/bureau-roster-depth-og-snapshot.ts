/** Compact roster-depth payload for OG export — mirrors BureauRosterDepth panel. */

export interface RosterDepthOgPos {
  pos: string;
  grade: string;
  count: number;
  elite: number;
  topName: string;
}

export interface BureauRosterDepthOgSnapshot {
  team?: string;
  totalPlayers?: number;
  positions: RosterDepthOgPos[];
}

type CompactPos = { p: string; g: string; c: number; e: number; n: string };
type CompactSnap = { t?: string; tp?: number; rows: CompactPos[] };

function hasSnapshotData(snap: BureauRosterDepthOgSnapshot): boolean {
  return snap.positions.length > 0;
}

function fromCompact(c: CompactSnap): BureauRosterDepthOgSnapshot | null {
  if (!Array.isArray(c.rows) || c.rows.length === 0) return null;
  const snap: BureauRosterDepthOgSnapshot = {
    team: c.t,
    totalPlayers: c.tp,
    positions: c.rows.map((row) => ({
      pos: row.p,
      grade: row.g,
      count: row.c,
      elite: row.e,
      topName: row.n,
    })),
  };
  return hasSnapshotData(snap) ? snap : null;
}

/** Base64url JSON for `snapshot` query param on `/og/roster-depth`. */
export function encodeBureauRosterDepthOgSnapshot(
  snap: BureauRosterDepthOgSnapshot,
): string | undefined {
  if (!hasSnapshotData(snap)) return undefined;
  const compact: CompactSnap = {
    t: snap.team,
    tp: snap.totalPlayers,
    rows: snap.positions.map((row) => ({
      p: row.pos,
      g: row.grade,
      c: row.count,
      e: row.elite,
      n: row.topName,
    })),
  };
  const json = JSON.stringify(compact);
  if (typeof btoa === "function") {
    return btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  return undefined;
}

type PosBlock = {
  count?: number;
  elite?: number;
  depth?: Array<{ name?: string; dynasty_value?: number | null }>;
};

function depthGrade(block: PosBlock): string {
  const count = block.count ?? 0;
  const elite = block.elite ?? 0;
  if (count === 0) return "F";
  if (elite >= 2 || (elite >= 1 && count >= 4)) return "A";
  if (elite >= 1 || count >= 3) return "B";
  if (count >= 2) return "C";
  return "D";
}

/** Build snapshot from in-panel Bureau roster depth data. */
export function buildRosterDepthOgSnapshot(
  depth: Record<string, PosBlock>,
  opts?: { team?: string; totalPlayers?: number },
): BureauRosterDepthOgSnapshot {
  const positions: RosterDepthOgPos[] = (["QB", "RB", "WR", "TE"] as const).map((pos) => {
    const block = depth[pos] ?? {};
    const top = [...(block.depth ?? [])].sort((a, b) => (b.dynasty_value ?? 0) - (a.dynasty_value ?? 0))[0];
    return {
      pos,
      grade: depthGrade(block),
      count: block.count ?? 0,
      elite: block.elite ?? 0,
      topName: top?.name ?? "—",
    };
  });
  return { team: opts?.team, totalPlayers: opts?.totalPlayers, positions };
}

export function decodeBureauRosterDepthOgSnapshot(param: string): BureauRosterDepthOgSnapshot | null {
  if (!param) return null;
  try {
    const padded = param.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(padded);
    return fromCompact(JSON.parse(json) as CompactSnap);
  } catch {
    return null;
  }
}
