"use client";

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
  const canExport = !pending && !error && Boolean(briefing?.trim());
  const ogParams = new URLSearchParams({
    question,
    briefing: briefing.slice(0, 600),
    urgency,
    download: "1",
  });
  if (specialists.length > 0) ogParams.set("specialists", specialists.join(","));

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
