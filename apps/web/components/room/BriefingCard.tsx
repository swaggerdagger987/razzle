"use client";

import type { Urgency } from "@razzle/types";
import { BriefingShareBar } from "./BriefingShareBar";

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
      {!pending && !error && briefing ? (
        <BriefingShareBar
          question={question}
          briefing={briefing}
          urgency={urgency}
          specialists={specialists}
        />
      ) : null}
    </article>
  );
}
