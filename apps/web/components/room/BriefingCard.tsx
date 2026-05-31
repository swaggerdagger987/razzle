"use client";

import { useCallback, useState } from "react";
import { toRoom } from "@razzle/hallway";
import type { Urgency } from "@razzle/types";

interface Props {
  question: string;
  briefing: string;
  urgency: Urgency;
  specialists: string[];
  crossTriggers?: { agent: string; label: string }[];
  pending?: boolean;
  error?: string;
  cost?: number;
}

const URGENCY_CLASS: Record<Urgency, string> = {
  URGENT: "urgency-urgent",
  MONITOR: "urgency-monitor",
  OPPORTUNITY: "urgency-opportunity",
  ROUTINE: "urgency-routine",
};

export function BriefingCard({
  question,
  briefing,
  urgency,
  specialists,
  crossTriggers,
  pending,
  error,
  cost,
}: Props) {
  const [copied, setCopied] = useState(false);
  const canExport = !pending && !error && Boolean(briefing?.trim());
  const previewParams = new URLSearchParams({
    question,
    briefing: briefing.slice(0, 600),
    urgency,
  });
  if (specialists.length > 0) previewParams.set("specialists", specialists.join(","));
  const ogParams = new URLSearchParams(previewParams);
  ogParams.set("download", "1");

  const roomPath = toRoom({
    agentId: "razzle",
    question: question.slice(0, 120),
    panelSlug: "situation-room",
  });

  const copyLink = useCallback(async () => {
    const shareUrl =
      typeof window !== "undefined" ? `${window.location.origin}${roomPath}` : roomPath;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [roomPath]);

  return (
    <article className={`briefing-card chunky bg-bg-card p-4 ${URGENCY_CLASS[urgency]}`}>
      <header className="briefing-header">
        <span className="briefing-urgency">{urgency}</span>
        {specialists.length > 0 && (
          <span className="briefing-specialists">{specialists.join(", ")}</span>
        )}
        {cost != null && <span className="briefing-cost">${cost.toFixed(4)}</span>}
      </header>
      <p className="briefing-question">{question}</p>
      {pending && <p className="text-ink-medium">pulling film...</p>}
      {error && <p className="text-red">{error}</p>}
      {!pending && !error && briefing && <div className="briefing-body">{briefing}</div>}
      {!pending && crossTriggers && crossTriggers.length > 0 && (
        <p className="briefing-cross-trigger text-ink-medium mt-2 text-sm">
          {crossTriggers.map((t) => `${t.agent}: ${t.label}`).join(" · ")}
        </p>
      )}
      {canExport && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button type="button" className="btn-chunky text-xs" onClick={() => void copyLink()}>
            {copied ? "copied!" : "copy link"}
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
            href={`/og/briefing?${ogParams.toString()}`}
            download="razzle-briefing.png"
            className="btn-chunky active text-xs"
            style={{ background: "var(--orange)", color: "var(--text-on-accent)" }}
          >
            export card
          </a>
        </div>
      )}
    </article>
  );
}
