"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { toRoom } from "@razzle/hallway";
import {
  encodeBureauTradeFinderOgSnapshot,
  type BureauTradeFinderOgSnapshot,
} from "@/lib/bureau-trade-finder-og-snapshot";

interface Props {
  leagueId: string;
  userId: string;
  /** Encodes in-panel trade rows so OG card matches Bureau view. */
  snapshot?: BureauTradeFinderOgSnapshot;
}

/** Copyable trade-finder URL + OG preview/export — mirrors BriefingShareBar. */
export function BureauTradeFinderShareBar({ leagueId, userId, snapshot }: Props) {
  const [copiedTrade, setCopiedTrade] = useState(false);
  const [copiedPreview, setCopiedPreview] = useState(false);

  const tradePath = `/league/${leagueId}/trade-finder`;

  const previewParams = useMemo(() => {
    const params = new URLSearchParams({
      league: leagueId,
      user: userId,
    });
    const snap = snapshot ? encodeBureauTradeFinderOgSnapshot(snapshot) : undefined;
    if (snap) params.set("snapshot", snap);
    return params;
  }, [leagueId, userId, snapshot]);

  const previewPath = `/og/trade-finder?${previewParams.toString()}`;
  const exportParams = new URLSearchParams(previewParams);
  exportParams.set("download", "1");

  const hero = snapshot?.hero_match ?? snapshot?.matches?.[0];
  const bonesRoomHref = hero
    ? (toRoom({
        agentId: "bones",
        question: `Should I offer ${hero.give.name} for ${hero.get.name} from ${hero.partner_team}? Value gap is ${hero.gap_pct}%.`,
        panelSlug: "trade-finder",
        player: {
          playerId: hero.give.player_id,
          name: hero.give.name,
          slug: hero.give.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          position: hero.give.position,
        },
      }) as Route)
    : null;

  const copyTradeLink = useCallback(async () => {
    const url =
      typeof window !== "undefined" ? `${window.location.origin}${tradePath}` : tradePath;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedTrade(true);
      window.setTimeout(() => setCopiedTrade(false), 2000);
    } catch {
      setCopiedTrade(false);
    }
  }, [tradePath]);

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
      <button type="button" className="btn-chunky text-xs" onClick={() => void copyTradeLink()}>
        {copiedTrade ? "copied!" : "copy trade link"}
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
        href={`/og/trade-finder?${exportParams.toString()}`}
        download="razzle-trade-finder.png"
        className="btn-chunky active text-xs"
        style={{ background: "var(--orange)", color: "var(--text-on-accent)" }}
      >
        export card
      </a>
      {bonesRoomHref && hero ? (
        <Link href={bonesRoomHref} className="text-xs text-orange underline">
          ask Bones about {hero.partner_team} →
        </Link>
      ) : null}
    </div>
  );
}
