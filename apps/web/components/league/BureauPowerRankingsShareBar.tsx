"use client";

import { useCallback, useState } from "react";
import {
  encodeBureauPowerRankingsOgSnapshot,
  type BureauPowerRankingsOgRow,
} from "@/lib/bureau-power-rankings-og-snapshot";

interface Props {
  leagueId: string;
  /** Top rows visible in Bureau — OG card matches this board without live API. */
  rows?: BureauPowerRankingsOgRow[];
}

/** Copyable power board URL + OG export — mirrors BureauH2HShareBar. */
export function BureauPowerRankingsShareBar({ leagueId, rows }: Props) {
  const [copied, setCopied] = useState(false);

  const boardPath = `/league/${leagueId}/power-rankings`;

  const ogParams = new URLSearchParams({
    league: leagueId,
    download: "1",
  });
  const snap =
    rows?.length ? encodeBureauPowerRankingsOgSnapshot({ rows: rows.slice(0, 5) }) : undefined;
  if (snap) ogParams.set("snapshot", snap);

  const copyLink = useCallback(async () => {
    const url =
      typeof window !== "undefined" ? `${window.location.origin}${boardPath}` : boardPath;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [boardPath]);

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <button type="button" className="btn-chunky text-xs" onClick={() => void copyLink()}>
        {copied ? "copied!" : "copy board link"}
      </button>
      <a
        href={`/og/power-rankings?${ogParams.toString()}`}
        download="razzle-power-rankings.png"
        className="btn-chunky active text-xs"
        style={{ background: "var(--orange)", color: "var(--text-on-accent)" }}
      >
        export card
      </a>
    </div>
  );
}
