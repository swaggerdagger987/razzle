import type { Urgency } from "@razzle/types";

/** Compact briefing payload for OG export — mirrors in-product Situation Room card. */
export interface RoomBriefingOgSnapshot {
  question: string;
  urgency: Urgency;
  briefing: string;
  specialists: string[];
}

type CompactBriefing = {
  q: string;
  u: string;
  b: string;
  s: string[];
};

const URGENCY_VALUES = new Set<string>(["URGENT", "MONITOR", "OPPORTUNITY", "ROUTINE"]);

function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function hasSnapshotData(snap: RoomBriefingOgSnapshot): boolean {
  return Boolean(snap.question?.trim() && snap.briefing?.trim());
}

function fromCompact(c: CompactBriefing): RoomBriefingOgSnapshot | null {
  if (!c?.q?.trim() || !c?.b?.trim()) return null;
  const urgency = URGENCY_VALUES.has(c.u) ? (c.u as Urgency) : "ROUTINE";
  const snap: RoomBriefingOgSnapshot = {
    question: c.q,
    urgency,
    briefing: c.b,
    specialists: Array.isArray(c.s) ? c.s.filter(Boolean) : [],
  };
  return hasSnapshotData(snap) ? snap : null;
}

/** Base64url JSON for `snapshot` query param on `/og/briefing`. */
export function encodeRoomBriefingOgSnapshot(snap: RoomBriefingOgSnapshot): string | undefined {
  if (!hasSnapshotData(snap)) return undefined;
  const compact: CompactBriefing = {
    q: truncate(snap.question, 200),
    u: snap.urgency,
    b: truncate(snap.briefing, 480),
    s: snap.specialists.slice(0, 6),
  };
  const json = JSON.stringify(compact);
  if (typeof btoa === "function") {
    return btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  return undefined;
}

/** Decode `snapshot` query param from Room briefing export. */
export function decodeRoomBriefingOgSnapshot(param: string): RoomBriefingOgSnapshot | null {
  try {
    const b64 = param.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(b64);
    return fromCompact(JSON.parse(json) as CompactBriefing);
  } catch {
    return null;
  }
}
