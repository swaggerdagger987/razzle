"use client";

import { useCallback, useState } from "react";

interface Props {
  leagueId: string;
}

/** Copyable Trade Network URL + OG export — mirrors BureauMonteCarloShareBar. */
export function BureauTradeNetworkShareBar({ leagueId }: Props) {
  const [copied, setCopied] = useState(false);

  const networkPath = `/league/${leagueId}/trade-network`;

  const ogParams = new URLSearchParams({
    league: leagueId,
    download: "1",
  });

  const copyLink = useCallback(async () => {
    const url =
      typeof window !== "undefined" ? `${window.location.origin}${networkPath}` : networkPath;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [networkPath]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className="btn-chunky text-xs" onClick={() => void copyLink()}>
        {copied ? "copied!" : "copy network link"}
      </button>
      <a
        href={`/og/trade-network?${ogParams.toString()}`}
        download="razzle-trade-network.png"
        className="btn-chunky active text-xs"
        style={{ background: "var(--orange)", color: "var(--text-on-accent)" }}
      >
        export card
      </a>
    </div>
  );
}
