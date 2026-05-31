/** Compact H2H payload for OG export — mirrors in-product Bureau Head-to-Head panel. */

export interface BureauH2HPositionBar {
  position: string;
  your_count: number;
  their_count: number;
}

export interface BureauH2HOgSnapshot {
  you: { team: string; record: string; ppg: number };
  them: { team: string; record: string; ppg: number };
  position_compare: BureauH2HPositionBar[];
  trade_fit?: { you_could_offer: string[]; you_could_target: string[] };
}

export interface H2HData {
  you?: { team: string; record: string; ppg: number };
  them?: { team: string; record: string; ppg: number };
  position_compare?: BureauH2HPositionBar[];
  trade_fit?: { you_could_offer?: string[]; you_could_target?: string[] };
}

type CompactH2H = {
  y: { t: string; r: string; p: number };
  m: { t: string; r: string; p: number };
  pc: { p: string; y: number; m: number }[];
  tf?: { o: string[]; g: string[] };
};

/** Legacy ShareBar compact (y/t full teams, pc.position/y/t) — still decoded for in-flight links. */
type LegacyCompactH2H = {
  y: { team: string; record: string; ppg: number };
  t: { team: string; record: string; ppg: number };
  pc: { position: string; y: number; t: number }[];
  tf?: { o: string[]; g: string[] };
};

function hasSnapshotData(snap: BureauH2HOgSnapshot): boolean {
  return Boolean(snap.you?.team && snap.them?.team && snap.position_compare?.length > 0);
}

function fromCanonicalCompact(c: CompactH2H): BureauH2HOgSnapshot | null {
  if (!c?.y?.t || !c?.m?.t || !Array.isArray(c.pc) || c.pc.length === 0) return null;
  const snap: BureauH2HOgSnapshot = {
    you: { team: c.y.t, record: c.y.r, ppg: c.y.p },
    them: { team: c.m.t, record: c.m.r, ppg: c.m.p },
    position_compare: c.pc.map((row) => ({
      position: row.p,
      your_count: row.y,
      their_count: row.m,
    })),
    trade_fit: c.tf ? { you_could_offer: c.tf.o ?? [], you_could_target: c.tf.g ?? [] } : undefined,
  };
  return hasSnapshotData(snap) ? snap : null;
}

function fromLegacyCompact(c: LegacyCompactH2H): BureauH2HOgSnapshot | null {
  if (!c?.y?.team || !c?.t?.team || !Array.isArray(c.pc) || c.pc.length === 0) return null;
  const snap: BureauH2HOgSnapshot = {
    you: { team: c.y.team, record: c.y.record, ppg: c.y.ppg },
    them: { team: c.t.team, record: c.t.record, ppg: c.t.ppg },
    position_compare: c.pc.map((row) => ({
      position: row.position,
      your_count: row.y,
      their_count: row.t,
    })),
    trade_fit: c.tf ? { you_could_offer: c.tf.o ?? [], you_could_target: c.tf.g ?? [] } : undefined,
  };
  return hasSnapshotData(snap) ? snap : null;
}

function fromCompactPayload(parsed: unknown): BureauH2HOgSnapshot | null {
  if (!parsed || typeof parsed !== "object") return null;
  const c = parsed as Record<string, unknown>;
  if (c.m && c.y && typeof c.y === "object" && typeof c.m === "object") {
    return fromCanonicalCompact(parsed as CompactH2H);
  }
  if (c.t && c.y && typeof c.y === "object" && typeof c.t === "object") {
    const y = c.y as Record<string, unknown>;
    if ("team" in y) return fromLegacyCompact(parsed as LegacyCompactH2H);
  }
  return null;
}

/** Base64url JSON for `snapshot` query param on `/og/head-to-head`. */
export function encodeBureauH2HOgSnapshot(snap: BureauH2HOgSnapshot): string | undefined {
  if (!hasSnapshotData(snap)) return undefined;
  const compact: CompactH2H = {
    y: { t: snap.you.team, r: snap.you.record, p: snap.you.ppg },
    m: { t: snap.them.team, r: snap.them.record, p: snap.them.ppg },
    pc: snap.position_compare.map((row) => ({
      p: row.position,
      y: row.your_count,
      m: row.their_count,
    })),
    tf: snap.trade_fit
      ? { o: snap.trade_fit.you_could_offer, g: snap.trade_fit.you_could_target }
      : undefined,
  };
  const json = JSON.stringify(compact);
  if (typeof btoa === "function") {
    return btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  return undefined;
}

/** Decode `snapshot` query param from Bureau H2H export — matches encode compact keys (y/m/pc). */
export function decodeBureauH2HOgSnapshot(param: string): BureauH2HOgSnapshot | null {
  try {
    const b64 = param.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(b64);
    return fromCompactPayload(JSON.parse(json));
  } catch {
    return null;
  }
}

export function bureauH2HOgSnapshotToData(snap: BureauH2HOgSnapshot): H2HData {
  return {
    you: snap.you,
    them: snap.them,
    position_compare: snap.position_compare,
    trade_fit: snap.trade_fit,
  };
}
