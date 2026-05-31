"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { AGENT_BY_ID } from "@razzle/agents";
import { toRoom } from "@razzle/hallway";
import {
  encodeBureauSelfScoutOgSnapshot,
  type BureauSelfScoutOgSnapshot,
} from "@/lib/bureau-self-scout-og-snapshot";

interface Props {
  leagueId: string;
  userId: string;
  /** Thinnest position label for Hawkeye hallway CTA. */
  weakestPosition: string;
  /** Encodes in-panel depth grades so OG card matches Bureau view. */
  snapshot?: BureauSelfScoutOgSnapshot;
}

/** Copyable Self-Scout URL + OG export — mirrors BureauH2HShareBar. */
export function BureauSelfScoutShareBar({
  leagueId,
  userId,
  weakestPosition,
  snapshot,
}: Props) {
  const [copied, setCopied] = useState(false);
  const hawkeye = AGENT_BY_ID.hawkeye;

  const scoutPath = `/league/${leagueId}`;

  const ogParams = new URLSearchParams({
    league: leagueId,
    user: userId,
    download: "1",
  });
  const snap = snapshot ? encodeBureauSelfScoutOgSnapshot(snapshot) : undefined;
  if (snap) ogParams.set("snapshot", snap);

  const hawkeyeRoomHref = toRoom({
    agentId: "hawkeye",
    question: `Self-Scout says ${weakestPosition} is my thinnest spot — who should I target?`,
  }) as Route;

  const copyLink = useCallback(async () => {
    const url =
      typeof window !== "undefined" ? `${window.location.origin}${scoutPath}` : scoutPath;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [scoutPath]);

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <button type="button" className="btn-chunky text-xs" onClick={() => void copyLink()}>
        {copied ? "copied!" : "copy scout link"}
      </button>
      <a
        href={`/og/self-scout?${ogParams.toString()}`}
        download="razzle-self-scout.png"
        className="btn-chunky active text-xs"
        style={{ background: "var(--orange)", color: "var(--text-on-accent)" }}
      >
        export card
      </a>
      <Link href={hawkeyeRoomHref} className="btn-chunky text-sm bg-bg">
        ask {hawkeye.name} in film room →
      </Link>
    </div>
  );
}
