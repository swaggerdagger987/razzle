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

interface CompactH2HSnapshot {
  y?: { t: string; r: string; p: number };
  m?: { t: string; r: string; p: number };
  pc?: { p: string; y: number; m: number }[];
  tf?: { o?: string[]; g?: string[] };
}

function decodeBase64Url(param: string): string | null {
  try {
    let b64 = param.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    if (typeof atob === "function") return atob(b64);
    if (typeof Buffer !== "undefined") return Buffer.from(b64, "base64").toString("utf8");
    return null;
  } catch {
    return null;
  }
}

/** Decode `snapshot` query param from Bureau H2H export links. */
export function decodeBureauH2HOgSnapshot(param: string): BureauH2HOgSnapshot | null {
  const json = decodeBase64Url(param.trim());
  if (!json) return null;
  try {
    const compact = JSON.parse(json) as CompactH2HSnapshot;
    const snap: BureauH2HOgSnapshot = {
      you: {
        team: compact.y?.t ?? "",
        record: compact.y?.r ?? "",
        ppg: compact.y?.p ?? 0,
      },
      them: {
        team: compact.m?.t ?? "",
        record: compact.m?.r ?? "",
        ppg: compact.m?.p ?? 0,
      },
      position_compare: (compact.pc ?? []).map((row) => ({
        position: row.p,
        your_count: row.y,
        their_count: row.m,
      })),
      trade_fit: compact.tf
        ? {
            you_could_offer: compact.tf.o ?? [],
            you_could_target: compact.tf.g ?? [],
          }
        : undefined,
    };
    return hasSnapshotData(snap) ? snap : null;
  } catch {
    return null;
  }
}
