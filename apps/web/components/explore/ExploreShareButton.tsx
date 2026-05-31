"use client";

import { useCallback, useState } from "react";

interface Props {
  universe: string;
  sort: string;
  dir: string;
  q: string;
  pos: string[];
}

/** Canonical nuqs params for explore page + OG export — always includes universe. */
export function buildExploreShareParams({
  universe,
  sort,
  dir,
  q,
  pos,
}: Props): URLSearchParams {
  const params = new URLSearchParams({ universe, sort, dir });
  if (q) params.set("q", q);
  if (pos.length) params.set("pos", pos.join(","));
  return params;
}

export function buildExplorePageUrl(origin: string, props: Props): string {
  return `${origin}/explore?${buildExploreShareParams(props).toString()}`;
}

export function buildExploreOgUrl(origin: string, props: Props, download = false): string {
  const params = buildExploreShareParams(props);
  if (download) params.set("download", "1");
  return `${origin}/og/explore?${params.toString()}`;
}

export function ExploreShareButton(props: Props) {
  const { universe, sort, dir, q, pos } = props;
  const [copied, setCopied] = useState(false);

  const previewParams = buildExploreShareParams(props);
  const ogParams = new URLSearchParams(previewParams);
  ogParams.set("download", "1");

  const copyLink = useCallback(async () => {
    if (typeof window === "undefined") return;
    const exploreUrl = buildExplorePageUrl(window.location.origin, props);
    try {
      await navigator.clipboard.writeText(exploreUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [universe, sort, dir, q, pos]);

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
