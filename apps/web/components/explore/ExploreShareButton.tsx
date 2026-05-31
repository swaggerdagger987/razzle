"use client";

import { useCallback, useMemo, useState } from "react";
import { buildExploreShareQuery } from "@/lib/explore-params";

interface Props {
  universe: string;
  sort: string;
  dir: string;
  q: string;
  pos: string[];
}

export function ExploreShareButton({ universe, sort, dir, q, pos }: Props) {
  const [copied, setCopied] = useState(false);

  const previewParams = useMemo(
    () => buildExploreShareQuery({ universe, sort, dir, q, pos }),
    [universe, sort, dir, q, pos],
  );
  const ogParams = useMemo(
    () => buildExploreShareQuery({ universe, sort, dir, q, pos, download: true }),
    [universe, sort, dir, q, pos],
  );

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/explore?${previewParams.toString()}`;
  }, [previewParams]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [shareUrl]);

  const exportLabel = universe === "college" ? "export college card" : "export card";

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
        {exportLabel}
      </a>
    </div>
  );
}
