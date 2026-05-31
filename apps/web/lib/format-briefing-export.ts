import type { Urgency } from "@razzle/types";

export interface BriefingExportInput {
  question: string;
  briefing: string;
  urgency: Urgency;
  specialists: string[];
  crossTriggers?: { agent: string; label: string }[];
  roomUrl?: string;
}

/** Plain-text briefing block for Slack / Reddit paste (Slack *bold* compatible). */
export function formatBriefingForExport({
  question,
  briefing,
  urgency,
  specialists,
  crossTriggers,
  roomUrl = "https://razzle.lol/room",
}: BriefingExportInput): string {
  const lines: string[] = [
    `*${urgency}* — Razzle Situation Room`,
    "",
    `*Q:* ${question.trim()}`,
  ];

  if (specialists.length > 0) {
    lines.push(`*Staff:* ${specialists.join(", ")}`);
  }

  lines.push("", briefing.trim());

  if (crossTriggers && crossTriggers.length > 0) {
    lines.push(
      "",
      `*Follow-ups:* ${crossTriggers.map((t) => `${t.agent}: ${t.label}`).join(" · ")}`,
    );
  }

  lines.push("", `— ${roomUrl}`);
  return lines.join("\n");
}
