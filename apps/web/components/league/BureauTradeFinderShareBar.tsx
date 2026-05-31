"use client";

import { useCallback, useState } from "react";

interface Props {
  leagueId: string;
  userId: string;
}

/** Copyable Trade Finder URL + OG export — mirrors BureauH2HShareBar. */
export function BureauTradeFinderShareBar({ leagueId, userId }: Props) {
  const [copied, setCopied] = useState(false);

  const finderPath = `/league/${leagueId}/trade-finder`;

  const ogParams = new URLSearchParams({
    league: leagueId,
    user: userId,
    download: "1",
  });

  const copyLink = useCallback(async () => {
    const url =
      typeof window !== "undefined" ? `${window.location.origin}${finderPath}` : finderPath;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [finderPath]);

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <button type="button" className="btn-chunky text-xs" onClick={() => void copyLink()}>
        {copied ? "copied!" : "copy deal link"}
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
