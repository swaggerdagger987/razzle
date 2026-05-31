"use client";

import { useCallback, useMemo, useState } from "react";
import { toLab } from "@razzle/hallway";
import {
  DEFAULT_LAB_OG_PLAYER_ID,
  encodeOgSnapshot,
  PLAYER_SCOPED_OG_SLUGS,
  type OgSnapshotRow,
} from "./LabOgExportLink";

export interface LabPanelShareBarProps {
  slug: string;
  downloadName?: string;
  snapshotRows?: OgSnapshotRow[];
  position?: string;
  playerId?: string;
  /** Display name for OG toLab watermark on player-scoped panels (e.g. gamelog). */
  playerName?: string;
  copyLabel?: string;
}

/** Copyable panel URL + OG preview/export — mirrors ExploreShareButton / BureauH2HShareBar. */
export function LabPanelShareBar({
  slug,
  downloadName,
  snapshotRows,
  position,
  playerId,
  playerName,
  copyLabel = "copy panel link",
}: LabPanelShareBarProps) {
  const [copied, setCopied] = useState(false);

  const panelPath = useMemo(() => {
    const base = toLab(slug);
    if (!position) return base;
    const sep = base.includes("?") ? "&" : "?";
    return `${base}${sep}position=${encodeURIComponent(position)}`;
  }, [slug, position]);

  const ogParams = useMemo(() => {
    const params = new URLSearchParams();
    const isPlayerScoped = (PLAYER_SCOPED_OG_SLUGS as readonly string[]).includes(slug);
    const resolvedPlayerId =
      playerId?.trim() || (isPlayerScoped ? DEFAULT_LAB_OG_PLAYER_ID : undefined);
    if (resolvedPlayerId) params.set("player_id", resolvedPlayerId);
    if (playerName?.trim()) params.set("name", playerName.trim());
    if (position) params.set("position", position);
    const snapshot = snapshotRows?.length ? encodeOgSnapshot(snapshotRows) : undefined;
    if (snapshot) params.set("snapshot", snapshot);
    return params;
  }, [slug, snapshotRows, position, playerId, playerName]);

  const previewPath = `/og/${slug}?${ogParams.toString()}`;
  const exportParams = new URLSearchParams(ogParams);
  exportParams.set("download", "1");
  const exportPath = `/og/${slug}?${exportParams.toString()}`;
  const file = downloadName ?? `razzle-${slug}.png`;

  const copyLink = useCallback(async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${panelPath}`
        : panelPath;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [panelPath]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className="btn-chunky text-xs" onClick={() => void copyLink()}>
        {copied ? "copied!" : copyLabel}
      </button>
      <a
        href={previewPath}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-chunky text-xs"
      >
        preview card
      </a>
      <a
        href={exportPath}
        download={file}
        className="btn-chunky active text-xs"
        style={{ background: "var(--orange)", color: "var(--text-on-accent)" }}
      >
        export card
      </a>
    </div>
  );
}
