/** Compact roster depth payload for OG export — mirrors Bureau Roster Depth grades. */

export type BureauRosterDepthOgRow = {
  position: string;
  count: number;
  elite: number;
  grade: string;
};

export type BureauRosterDepthOgSnapshot = {
  totalPlayers: number;
  rows: BureauRosterDepthOgRow[];
};

type CompactRow = { p: string; c: number; e: number; g: string };
type CompactDepth = { tp: number; r: CompactRow[] };

const POS_ORDER = ["QB", "RB", "WR", "TE"] as const;

function depthGrade(count: number, elite: number): string {
  if (count === 0) return "F";
  if (elite >= 2 || (elite >= 1 && count >= 4)) return "A";
  if (elite >= 1 || count >= 3) return "B";
  if (count >= 2) return "C";
  return "D";
}

function hasSnapshotData(snap: BureauRosterDepthOgSnapshot): boolean {
  return snap.rows.length > 0;
}

function fromCompact(c: CompactDepth): BureauRosterDepthOgSnapshot | null {
  const rows = (c.r ?? [])
    .map((row) => ({
      position: row.p,
      count: row.c,
      elite: row.e,
      grade: row.g,
    }))
    .filter((row) => row.position);
  if (!rows.length) return null;
  return { totalPlayers: c.tp ?? 0, rows };
}

function toCompact(snap: BureauRosterDepthOgSnapshot): CompactDepth {
  return {
    tp: snap.totalPlayers,
    r: snap.rows
      .filter((row) => POS_ORDER.includes(row.position as (typeof POS_ORDER)[number]))
      .map((row) => ({
        p: row.position,
        c: row.count,
        e: row.elite,
        g: row.grade,
      })),
  };
}

export function rosterDepthSnapshotFromBureau(
  depth: Record<string, { count?: number; elite?: number }>,
  totalPlayers: number,
): BureauRosterDepthOgSnapshot | null {
  const rows = POS_ORDER.map((position) => {
    const block = depth[position] ?? {};
    const count = block.count ?? 0;
    const elite = block.elite ?? 0;
    return { position, count, elite, grade: depthGrade(count, elite) };
  });
  const snap = { totalPlayers, rows };
  return hasSnapshotData(snap) ? snap : null;
}

export function encodeBureauRosterDepthOgSnapshot(
  snap: BureauRosterDepthOgSnapshot,
): string | undefined {
  if (!hasSnapshotData(snap)) return undefined;
  const json = JSON.stringify(toCompact(snap));
  if (typeof btoa === "function") {
    return btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  return undefined;
}

export function decodeBureauRosterDepthOgSnapshot(
  param: string,
): BureauRosterDepthOgSnapshot | null {
  try {
    const b64 = param.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(b64);
    return fromCompact(JSON.parse(json) as CompactDepth);
  } catch {
    return null;
  }
}
