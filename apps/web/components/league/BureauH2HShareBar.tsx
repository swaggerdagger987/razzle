"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { toRoom } from "@razzle/hallway";
import {
  encodeBureauH2HOgSnapshot,
  type BureauH2HOgSnapshot,
} from "@/lib/bureau-h2h-og-snapshot";

interface Props {
  leagueId: string;
  userId: string;
  opponentId?: string;
  /** Encodes in-panel rivalry so OG card matches Bureau view. */
  snapshot?: BureauH2HOgSnapshot;
}

/** Copyable rivalry URL + OG preview/export — mirrors BureauTradeFinderShareBar. */
export function BureauH2HShareBar({ leagueId, userId, opponentId, snapshot }: Props) {
  const [copiedRivalry, setCopiedRivalry] = useState(false);
  const [copiedPreview, setCopiedPreview] = useState(false);

  const rivalryQuery = new URLSearchParams({ user: userId });
  if (opponentId) rivalryQuery.set("opponent", opponentId);
  const rivalryPath = `/league/${leagueId}/head-to-head?${rivalryQuery.toString()}`;

  const previewParams = useMemo(() => {
    const params = new URLSearchParams({
      league: leagueId,
      user: userId,
    });
    if (opponentId) params.set("opponent", opponentId);
    const snap = snapshot ? encodeBureauH2HOgSnapshot(snapshot) : undefined;
    if (snap) params.set("snapshot", snap);
    return params;
  }, [leagueId, userId, opponentId, snapshot]);

  const previewPath = `/og/head-to-head?${previewParams.toString()}`;
  const exportParams = new URLSearchParams(previewParams);
  exportParams.set("download", "1");

  const offer = (snapshot?.trade_fit?.you_could_offer ?? []).join(", ") || "—";
  const want = (snapshot?.trade_fit?.you_could_target ?? []).join(", ") || "—";
  const atlasRoomHref =
    snapshot?.them?.team
      ? (toRoom({
          agentId: "atlas",
          question: `How do I beat ${snapshot.them.team} (${snapshot.them.record})? I'm deeper at ${offer} and thin at ${want}.`,
          panelSlug: "head-to-head",
        }) as Route)
      : null;

  const copyRivalryLink = useCallback(async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${rivalryPath}`
        : rivalryPath;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedRivalry(true);
      window.setTimeout(() => setCopiedRivalry(false), 2000);
    } catch {
      setCopiedRivalry(false);
    }
  }, [rivalryPath]);

  const copyPreviewLink = useCallback(async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${previewPath}`
        : previewPath;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedPreview(true);
      window.setTimeout(() => setCopiedPreview(false), 2000);
    } catch {
      setCopiedPreview(false);
    }
  }, [previewPath]);

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <button type="button" className="btn-chunky text-xs" onClick={() => void copyRivalryLink()}>
        {copiedRivalry ? "copied!" : "copy rivalry link"}
      </button>
      <button type="button" className="btn-chunky text-xs" onClick={() => void copyPreviewLink()}>
        {copiedPreview ? "copied!" : "copy card link"}
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
        href={`/og/head-to-head?${exportParams.toString()}`}
        download="razzle-head-to-head.png"
        className="btn-chunky active text-xs"
        style={{ background: "var(--orange)", color: "var(--text-on-accent)" }}
      >
        export card
      </a>
      {atlasRoomHref && snapshot?.them ? (
        <Link href={atlasRoomHref} className="text-xs text-orange underline">
          ask Atlas about {snapshot.them.team} →
        </Link>
      ) : null}
    </div>
  );
}
