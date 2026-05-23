/**
 * Canonical agent registry — connective tissue for Lab, Bureau, Room, Player Sheet.
 * See docs/v2/AGENTS.md. Do not duplicate agent metadata elsewhere.
 */

export type AgentId = "razzle" | "dolphin" | "hawkeye" | "bones" | "octo" | "atlas";

export type AgentSurface = "lab" | "bureau" | "room" | "player-sheet" | "explore";

export interface AgentDefinition {
  id: AgentId;
  name: string;
  role: string;
  emoji: string;
  /** Public SVG under /agents/{avatar}.svg */
  avatar: string;
  loadingCopy: string;
  emptyCopy: string;
  /** Injury / health questions route here first */
  injuryPriority?: boolean;
  surfaces: AgentSurface[];
  labPanels?: string[];
  bureauSections?: string[];
}

export const AGENTS: AgentDefinition[] = [
  {
    id: "razzle",
    name: "Razzle",
    role: "Chief of Staff",
    emoji: "🐯",
    avatar: "razzle",
    loadingCopy: "pulling film...",
    emptyCopy: "Nothing on the board yet.",
    surfaces: ["lab", "bureau", "room", "player-sheet", "explore"],
    labPanels: ["dashboard"],
    bureauSections: ["overview"],
  },
  {
    id: "dolphin",
    name: "Dr. Dolphin",
    role: "Medical Analyst",
    emoji: "🐬",
    avatar: "dolphin",
    loadingCopy: "checking the injury wire...",
    emptyCopy: "Clean bill of health. For now.",
    injuryPriority: true,
    surfaces: ["lab", "bureau", "room", "player-sheet", "explore"],
    labPanels: ["injury-report", "durability", "workload"],
    bureauSections: ["roster-depth", "self-scout"],
  },
  {
    id: "hawkeye",
    name: "Hawkeye",
    role: "Scout",
    emoji: "🎯",
    avatar: "hawkeye",
    loadingCopy: "scanning the tape...",
    emptyCopy: "Nothing worth your time right now.",
    surfaces: ["lab", "bureau", "room", "player-sheet"],
    labPanels: ["weekly", "breakouts", "prospects", "waiver-wire", "usage-trends"],
    bureauSections: ["self-scout", "roster-depth", "waiver-tendencies"],
  },
  {
    id: "bones",
    name: "Bones",
    role: "Diplomat",
    emoji: "🦴",
    avatar: "bones",
    loadingCopy: "reading the room...",
    emptyCopy: "Market's quiet. Check back Wednesday.",
    surfaces: ["lab", "bureau", "room", "player-sheet"],
    labPanels: ["tradevalues", "trade-values", "buysell", "trade-finder"],
    bureauSections: ["trade-network", "trade-finder", "pressure-map", "manager-profiles"],
  },
  {
    id: "octo",
    name: "Octo",
    role: "Quant",
    emoji: "🐙",
    avatar: "octo",
    loadingCopy: "running the numbers...",
    emptyCopy: "Insufficient data. Octo needs more.",
    surfaces: ["lab", "bureau", "room", "player-sheet"],
    labPanels: ["rankings", "monte-carlo", "projections", "efficiency", "aging"],
    bureauSections: ["monte-carlo", "power-rankings", "strength-of-schedule"],
  },
  {
    id: "atlas",
    name: "Atlas",
    role: "Historian",
    emoji: "📜",
    avatar: "atlas",
    loadingCopy: "pulling the archives...",
    emptyCopy: "No precedent found. That's rare.",
    surfaces: ["lab", "bureau", "room", "player-sheet"],
    labPanels: ["career-stats", "gamelog", "dynasty-history"],
    bureauSections: ["manager-profiles", "build-profiles", "trade-network", "head-to-head"],
  },
];

export const AGENT_IDS = AGENTS.map((a) => a.id);

export const AGENT_BY_ID: Record<AgentId, AgentDefinition> = Object.fromEntries(
  AGENTS.map((a) => [a.id, a]),
) as Record<AgentId, AgentDefinition>;

const INJURY_KEYWORDS =
  /\b(injur|hurt|questionable|doubtful|out|ir\b|pup|acl|hamstring|concussion|health|durability|return|gameday decision|load management)\b/i;

export function suggestAgentForQuestion(question: string, playerContext?: boolean): AgentId {
  if (INJURY_KEYWORDS.test(question)) return "dolphin";
  if (/\b(trade|deal|offer|leverage|negotiat)\b/i.test(question)) return "bones";
  if (/\b(waiver|pickup|breakout|snap|usage|target share|ros\b)\b/i.test(question)) return "hawkeye";
  if (/\b(history|last time|pattern|blind spot|precedent)\b/i.test(question)) return "atlas";
  if (/\b(odds|probability|projection|value|rank|ppg|floor|ceiling)\b/i.test(question)) return "octo";
  if (playerContext) return "dolphin";
  return "razzle";
}

export function loadingCopyForAgent(id: AgentId | "default" = "default"): string {
  if (id === "default") return AGENT_BY_ID.razzle.loadingCopy;
  return AGENT_BY_ID[id]?.loadingCopy ?? AGENT_BY_ID.razzle.loadingCopy;
}

export function agentsForSurface(surface: AgentSurface): AgentDefinition[] {
  return AGENTS.filter((a) => a.surfaces.includes(surface));
}

export function agentForPanel(slug: string): AgentDefinition | undefined {
  return AGENTS.find((a) => a.labPanels?.includes(slug));
}

export function agentForBureauSection(slug: string): AgentDefinition | undefined {
  return AGENTS.find((a) => a.bureauSections?.includes(slug));
}
