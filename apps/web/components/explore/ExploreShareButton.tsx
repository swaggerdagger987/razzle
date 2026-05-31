"use client";

import { useCallback, useState } from "react";

interface Props {
  universe: string;
  sort: string;
  dir: string;
  q: string;
  pos: string[];
  season?: number;
  team?: string[];
}

export function ExploreShareButton({ universe, sort, dir, q, pos, season = 0, team = [] }: Props) {
  const [copied, setCopied] = useState(false);

  const previewParams = new URLSearchParams({ universe, sort, dir });
  if (q) previewParams.set("q", q);
  if (pos.length) previewParams.set("pos", pos.join(","));
  if (season > 0) previewParams.set("season", String(season));
  if (team.length) previewParams.set("team", team.join(","));

  const ogParams = new URLSearchParams(previewParams);
  ogParams.set("download", "1");

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [shareUrl]);

  return (
    <div className="explore-share flex shrink-0 items-center gap-2">
      <button type="button" className="btn-chunky text-xs" onClick={() => void copyLink()}>
        {copied ? "copied!" : "copy link"}
      </button>
      <a
        href={`/og/explore?${previewParams.toString()}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-chunky text-xs"
      >
        preview card
      </a>
      <a
        href={`/og/explore?${ogParams.toString()}`}
        download="razzle-explore.png"
        className="btn-chunky active text-xs"
        style={{ background: "var(--orange)", color: "var(--text-on-accent)" }}
      >
        export card
      </a>
    </div>
  );
}
