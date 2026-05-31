"use client";

import { useCallback, useState } from "react";
import type { Urgency } from "@razzle/types";
import { formatBriefingForExport } from "@/lib/format-briefing-export";

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
  const canCopy = !pending && !error && Boolean(briefing?.trim());

  const copyBriefing = useCallback(async () => {
    const roomUrl =
      typeof window !== "undefined" ? `${window.location.origin}/room` : "https://razzle.lol/room";
    const text = formatBriefingForExport({
      question,
      briefing,
      urgency,
      specialists,
      crossTriggers,
      roomUrl,
    });
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [question, briefing, urgency, specialists, crossTriggers]);

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
      {canCopy && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button type="button" className="btn-chunky text-xs" onClick={() => void copyBriefing()}>
            {copied ? "copied!" : "copy for Slack/Reddit"}
          </button>
        </div>
      )}
    </article>
  );
}
