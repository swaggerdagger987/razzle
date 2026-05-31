"use client";

import { useCallback, useState } from "react";

/** Copyable Room URL + OG export — mirrors ExploreShareButton for Situation Room GTM. */
export function RoomShareBar() {
  const [copied, setCopied] = useState(false);

  const previewParams = new URLSearchParams();
  if (typeof window !== "undefined") {
    const page = new URLSearchParams(window.location.search);
    const agent = page.get("agent");
    const q = page.get("q");
    if (agent) previewParams.set("agent", agent);
    if (q) previewParams.set("q", q);
  }

  const ogParams = new URLSearchParams(previewParams);
  ogParams.set("download", "1");

  const copyLink = useCallback(async () => {
    const url = typeof window !== "undefined" ? window.location.href : "/room";
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, []);

  return (
    <div className="flex shrink-0 items-center gap-2">
      <button type="button" className="btn-chunky text-xs" onClick={() => void copyLink()}>
        {copied ? "copied!" : "copy link"}
      </button>
      <a
        href={`/og/room?${previewParams.toString()}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-chunky text-xs"
      >
        preview card
      </a>
      <a
        href={`/og/room?${ogParams.toString()}`}
        download="razzle-situation-room.png"
        className="btn-chunky active text-xs"
        style={{ background: "var(--orange)", color: "var(--text-on-accent)" }}
      >
        export card
      </a>
    </div>
  );
}
