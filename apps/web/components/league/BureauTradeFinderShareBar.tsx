"use client";

import { useCallback, useState } from "react";
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

/** Copyable trade-finder URL + OG export — mirrors BureauH2HShareBar. */
export function BureauTradeFinderShareBar({ leagueId, userId, snapshot }: Props) {
  const [copied, setCopied] = useState(false);

  const tradePath = `/league/${leagueId}/trade-finder`;

  const ogParams = new URLSearchParams({
    league: leagueId,
    user: userId,
    download: "1",
  });
  const snap = snapshot ? encodeBureauTradeFinderOgSnapshot(snapshot) : undefined;
  if (snap) ogParams.set("snapshot", snap);

  const copyLink = useCallback(async () => {
    const url =
      typeof window !== "undefined" ? `${window.location.origin}${tradePath}` : tradePath;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [tradePath]);

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <button type="button" className="btn-chunky text-xs" onClick={() => void copyLink()}>
        {copied ? "copied!" : "copy trade link"}
      </button>
      <a
        href={`/og/trade-finder?${ogParams.toString()}`}
        download="razzle-trade-finder.png"
        className="btn-chunky active text-xs"
        style={{ background: "var(--orange)", color: "var(--text-on-accent)" }}
      >
        export card
      </a>
    </div>
  );
}
