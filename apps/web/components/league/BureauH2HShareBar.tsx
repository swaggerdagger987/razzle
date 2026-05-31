"use client";

import { useCallback, useState } from "react";
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

/** Copyable rivalry URL + OG export — mirrors ExploreShareButton for Bureau H2H. */
export function BureauH2HShareBar({ leagueId, userId, opponentId, snapshot }: Props) {
  const [copied, setCopied] = useState(false);

  const rivalryQuery = new URLSearchParams({ user: userId });
  if (opponentId) rivalryQuery.set("opponent", opponentId);
  const rivalryPath = `/league/${leagueId}/head-to-head?${rivalryQuery.toString()}`;

  const ogParams = new URLSearchParams({
    league: leagueId,
    user: userId,
    download: "1",
  });
  if (opponentId) ogParams.set("opponent", opponentId);
  // Export card encodes in-panel rivalry; direct OG URLs with league/user try live API first.
  const snap = snapshot ? encodeBureauH2HOgSnapshot(snapshot) : undefined;
  if (snap) ogParams.set("snapshot", snap);

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

  const copyLink = useCallback(async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${rivalryPath}`
        : rivalryPath;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [rivalryPath]);

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <button type="button" className="btn-chunky text-xs" onClick={() => void copyLink()}>
        {copied ? "copied!" : "copy rivalry link"}
      </button>
      <a
        href={`/og/head-to-head?${ogParams.toString()}`}
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
