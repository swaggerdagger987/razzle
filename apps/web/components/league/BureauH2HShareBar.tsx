"use client";

import { useCallback, useState } from "react";

interface Props {
  leagueId: string;
  userId: string;
  opponentId?: string;
  /** Encoded in-product H2H rows for OG when API is cold */
  snapshot?: string;
}

/** Copyable rivalry URL + OG export — mirrors ExploreShareButton for Bureau H2H. */
export function BureauH2HShareBar({ leagueId, userId, opponentId, snapshot }: Props) {
  const [copied, setCopied] = useState(false);

  const rivalryPath = `/league/${leagueId}/head-to-head${
    opponentId ? `?opponent=${encodeURIComponent(opponentId)}` : ""
  }`;

  const ogParams = new URLSearchParams({
    league: leagueId,
    user: userId,
    download: "1",
  });
  if (opponentId) ogParams.set("opponent", opponentId);
  if (snapshot) ogParams.set("snapshot", snapshot);

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
    </div>
  );
}
