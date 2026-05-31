"use client";

import { useCallback, useMemo, useState } from "react";
import type { Urgency } from "@razzle/types";

interface Props {
  question: string;
  briefing: string;
  urgency: Urgency;
  specialists: string[];
}

/** Copyable briefing OG preview URL + PNG export — mirrors Bureau share bars. */
export function BriefingShareBar({ question, briefing, urgency, specialists }: Props) {
  const [copied, setCopied] = useState(false);

  const previewParams = useMemo(() => {
    const params = new URLSearchParams({
      question,
      briefing: briefing.slice(0, 600),
      urgency,
    });
    if (specialists.length > 0) params.set("specialists", specialists.join(","));
    return params;
  }, [question, briefing, urgency, specialists]);

  const previewPath = `/og/briefing?${previewParams.toString()}`;
  const exportParams = new URLSearchParams(previewParams);
  exportParams.set("download", "1");

  const copyLink = useCallback(async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${previewPath}`
        : previewPath;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [previewPath]);

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <button type="button" className="btn-chunky text-xs" onClick={() => void copyLink()}>
        {copied ? "copied!" : "copy briefing link"}
      </button>
      <a
        href={`/og/briefing?${previewParams.toString()}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-chunky text-xs"
      >
        preview card
      </a>
      <a
        href={`/og/briefing?${exportParams.toString()}`}
        download="razzle-briefing.png"
        className="btn-chunky active text-xs"
        style={{ background: "var(--orange)", color: "var(--text-on-accent)" }}
      >
        export card
      </a>
    </div>
  );
}
