"use client";

import type { Urgency } from "@razzle/types";

interface Props {
  question: string;
  briefing: string;
  urgency: Urgency;
  specialists: string[];
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
  pending,
  error,
  cost,
}: Props) {
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
    </article>
  );
}
