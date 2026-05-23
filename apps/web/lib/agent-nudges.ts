import type { AgentId } from "@razzle/agents";
import { toLab, toLeague, toRoom } from "@razzle/hallway";

export type NudgeSource = "lab" | "bureau";

export interface AgentNudgeDef {
  id: string;
  agentId: AgentId;
  source: NudgeSource;
  message: string;
  linkLabel: string;
  requiresLeague?: boolean;
  href: (ctx: { leagueId?: string }) => string;
}

/** Staff accent borders — matches legacy pixel palette. */
export const AGENT_ACCENT: Record<AgentId, string> = {
  razzle: "var(--orange)",
  dolphin: "var(--blue)",
  hawkeye: "var(--pos-rb)",
  bones: "var(--pos-wr)",
  octo: "var(--pos-te)",
  atlas: "var(--purple)",
};

const SESSION_COUNT_KEY = "razzle.nudge.session";
const DISMISSED_KEY = "razzle.nudge.dismissed";

export const MAX_NUDGES_PER_SESSION = 5;

export const AGENT_NUDGES: AgentNudgeDef[] = [
  {
    id: "dolphin-injury-to-bureau",
    agentId: "dolphin",
    source: "lab",
    message: "spotted an injury flag on your roster",
    linkLabel: "check roster health",
    requiresLeague: true,
    href: ({ leagueId }) => toLeague(leagueId),
  },
  {
    id: "hawkeye-usage-to-bureau",
    agentId: "hawkeye",
    source: "lab",
    message: "usage trend changed on a key player",
    linkLabel: "see self-scout",
    requiresLeague: true,
    href: ({ leagueId }) => toLeague(leagueId),
  },
  {
    id: "bones-value-to-trade",
    agentId: "bones",
    source: "lab",
    message: "found a trade value mismatch",
    linkLabel: "open trade values",
    href: () => toLab("tradevalues"),
  },
  {
    id: "octo-projection-shift",
    agentId: "octo",
    source: "lab",
    message: "projections shifted since last week",
    linkLabel: "check the numbers",
    href: () => toLab("efficiency"),
  },
  {
    id: "atlas-career-comp",
    agentId: "atlas",
    source: "lab",
    message: "this player's trajectory looks familiar",
    linkLabel: "see the history",
    href: () => toLab("aging"),
  },
  {
    id: "razzle-complex-decision",
    agentId: "razzle",
    source: "lab",
    message: "this looks like a decision your staff should weigh in on",
    linkLabel: "ask the team",
    href: () => toRoom({ agentId: "razzle", question: "Help me decide on this roster move" }),
  },
  {
    id: "bones-roster-gap",
    agentId: "bones",
    source: "bureau",
    message: "your roster has a positional gap",
    linkLabel: "find breakout candidates",
    requiresLeague: true,
    href: () => toLab("breakouts"),
  },
  {
    id: "bones-trade-finder",
    agentId: "bones",
    source: "bureau",
    message: "a matched trade might be on the table",
    linkLabel: "open trade finder",
    requiresLeague: true,
    href: ({ leagueId }) => toLeague(leagueId, "trade-finder"),
  },
  {
    id: "hawkeye-waiver-target",
    agentId: "hawkeye",
    source: "bureau",
    message: "someone on your waiver wire is trending up",
    linkLabel: "check breakouts",
    requiresLeague: true,
    href: () => toLab("breakouts"),
  },
  {
    id: "octo-odds-concern",
    agentId: "octo",
    source: "bureau",
    message: "your odds shifted this week",
    linkLabel: "re-run monte carlo",
    requiresLeague: true,
    href: ({ leagueId }) => toLeague(leagueId, "monte-carlo"),
  },
  {
    id: "atlas-rivalry",
    agentId: "atlas",
    source: "bureau",
    message: "this matchup has historical precedent",
    linkLabel: "see rivalry dossier",
    requiresLeague: true,
    href: ({ leagueId }) => toLeague(leagueId, "head-to-head"),
  },
  {
    id: "razzle-brief-ready",
    agentId: "razzle",
    source: "bureau",
    message: "Razzle has a take on your roster moves",
    linkLabel: "get the briefing",
    requiresLeague: true,
    href: () => toRoom({ agentId: "razzle", question: "Brief me on my roster and league context" }),
  },
];

export function getNudgeSessionCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    return parseInt(sessionStorage.getItem(SESSION_COUNT_KEY) || "0", 10);
  } catch {
    return 0;
  }
}

export function incrementNudgeSessionCount(): void {
  try {
    sessionStorage.setItem(SESSION_COUNT_KEY, String(getNudgeSessionCount() + 1));
  } catch {
    /* ignore */
  }
}

export function getDismissedNudgeIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(sessionStorage.getItem(DISMISSED_KEY) || "[]") as string[];
  } catch {
    return [];
  }
}

export function dismissNudgeId(id: string): void {
  const dismissed = getDismissedNudgeIds();
  if (dismissed.includes(id)) return;
  try {
    sessionStorage.setItem(DISMISSED_KEY, JSON.stringify([...dismissed, id]));
  } catch {
    /* ignore */
  }
}

export function pickEligibleNudge(
  source: NudgeSource,
  hasLeague: boolean,
): AgentNudgeDef | null {
  const dismissed = new Set(getDismissedNudgeIds());
  const eligible = AGENT_NUDGES.filter((n) => {
    if (n.source !== source) return false;
    if (dismissed.has(n.id)) return false;
    if (n.requiresLeague && !hasLeague) return false;
    return true;
  });
  if (eligible.length === 0) return null;
  return eligible[Math.floor(Math.random() * eligible.length)] ?? null;
}
