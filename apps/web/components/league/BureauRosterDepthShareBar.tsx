"use client";

import { useCallback, useState } from "react";

interface Props {
  leagueId: string;
  userId: string;
}

/** Copyable roster depth URL + OG export — mirrors BureauBuildProfilesShareBar. */
export function BureauRosterDepthShareBar({ leagueId, userId }: Props) {
  const [copied, setCopied] = useState(false);

  const boardPath = `/league/${leagueId}/roster-depth`;

  const ogParams = new URLSearchParams({
    league: leagueId,
    user: userId,
    download: "1",
  });

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
        {copied ? "copied!" : "copy depth link"}
      </button>
      <a
        href={`/og/roster-depth?${ogParams.toString()}`}
        download="razzle-roster-depth.png"
        className="btn-chunky active text-xs"
        style={{ background: "var(--orange)", color: "var(--text-on-accent)" }}
      >
        export card
      </a>
    </div>
  );
}
