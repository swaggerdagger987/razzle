"use client";

import { useCallback, useState } from "react";

interface Props {
  universe: string;
  sort: string;
  q: string;
  pos: string[];
}

export function ExploreShareButton({ universe, sort, q, pos }: Props) {
  const [copied, setCopied] = useState(false);

  const ogParams = new URLSearchParams({
    universe,
    sort,
    download: "1",
  });
  if (q) ogParams.set("q", q);
  if (pos.length) ogParams.set("pos", pos.join(","));

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
