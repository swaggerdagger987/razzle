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

function hasSnapshotData(snap: BureauH2HOgSnapshot): boolean {
  return Boolean(snap.you?.team && snap.them?.team && snap.position_compare?.length > 0);
}

/** Base64url JSON for `snapshot` query param on `/og/head-to-head`. */
export function encodeBureauH2HOgSnapshot(snap: BureauH2HOgSnapshot): string | undefined {
  if (!hasSnapshotData(snap)) return undefined;
  const compact = {
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

type CompactH2H = {
  y?: { t?: string; r?: string; p?: number };
  m?: { t?: string; r?: string; p?: number };
  pc?: { p?: string; y?: number; m?: number }[];
  tf?: { o?: string[]; g?: string[] };
};

/** Decode `snapshot` query param from Bureau H2H export — mirrors encode compact keys. */
export function decodeBureauH2HOgSnapshot(param: string): BureauH2HOgSnapshot | null {
  try {
    const b64 = param.replace(/-/g, "+").replace(/_/g, "/");
    const json = typeof atob === "function" ? atob(b64) : "";
    const raw = JSON.parse(json) as CompactH2H;
    const snap: BureauH2HOgSnapshot = {
      you: {
        team: raw.y?.t ?? "",
        record: raw.y?.r ?? "",
        ppg: Number(raw.y?.p ?? 0),
      },
      them: {
        team: raw.m?.t ?? "",
        record: raw.m?.r ?? "",
        ppg: Number(raw.m?.p ?? 0),
      },
      position_compare: (raw.pc ?? [])
        .filter((row) => row?.p)
        .map((row) => ({
          position: row.p ?? "",
          your_count: Number(row.y ?? 0),
          their_count: Number(row.m ?? 0),
        })),
      trade_fit: raw.tf
        ? {
            you_could_offer: raw.tf.o ?? [],
            you_could_target: raw.tf.g ?? [],
          }
        : undefined,
    };
    return hasSnapshotData(snap) ? snap : null;
  } catch {
    return null;
  }
}
