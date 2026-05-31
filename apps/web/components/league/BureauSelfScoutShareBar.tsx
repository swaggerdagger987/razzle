"use client";

import { useCallback, useState } from "react";

interface Props {
  leagueId: string;
  userId: string;
}

/** Copyable Self-Scout URL + OG export — mirrors BureauMonteCarloShareBar. */
export function BureauSelfScoutShareBar({ leagueId, userId }: Props) {
  const [copied, setCopied] = useState(false);

  const scoutPath = `/league/${leagueId}`;

  const ogParams = new URLSearchParams({
    league: leagueId,
    user: userId,
    download: "1",
  });

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
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className="btn-chunky text-xs" onClick={() => void copyLink()}>
        {copied ? "copied!" : "copy link"}
      </button>
      <a
        href={`/og/self-scout?${ogParams.toString()}`}
        download="razzle-self-scout.png"
        className="btn-chunky active text-xs"
        style={{ background: "var(--orange)", color: "var(--text-on-accent)" }}
      >
        export card
      </a>
    </div>
  );
}
