"use client";

import { useCallback, useState } from "react";

interface Props {
  leagueId: string;
}

/** Copyable manager profiles URL + OG export — mirrors BureauBuildProfilesShareBar. */
export function BureauManagerProfilesShareBar({ leagueId }: Props) {
  const [copied, setCopied] = useState(false);

  const boardPath = `/league/${leagueId}/manager-profiles`;

  const ogParams = new URLSearchParams({
    league: leagueId,
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
        {copied ? "copied!" : "copy profiles link"}
      </button>
      <a
        href={`/og/manager-profiles?${ogParams.toString()}`}
        download="razzle-manager-profiles.png"
        className="btn-chunky active text-xs"
        style={{ background: "var(--orange)", color: "var(--text-on-accent)" }}
      >
        export card
      </a>
    </div>
  );
}
