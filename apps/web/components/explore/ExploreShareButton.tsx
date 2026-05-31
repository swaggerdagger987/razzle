"use client";

import { useCallback, useState } from "react";
import {
  buildExploreOgExportParams,
  type ExploreOgExportInput,
} from "@/lib/explore-og-export-params";

type Props = Omit<ExploreOgExportInput, "download">;

export function ExploreShareButton({ universe, sort, dir, q, pos, season = 0, team = [] }: Props) {
  const [copied, setCopied] = useState(false);

  const previewParams = buildExploreOgExportParams({ universe, sort, dir, q, pos, season, team });
  const ogParams = buildExploreOgExportParams({
    universe,
    sort,
    dir,
    q,
    pos,
    season,
    team,
    download: true,
  });

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
        title={exportLabel}
      >
        {exportLabel}
      </a>
    </div>
  );
}
