// ─── Agent Connective Tissue — Territory Config ─────────────────────
// Single source of truth for where agents appear across Razzle.
// Design doc: docs/plans/2026-03-20-agent-connective-tissue-design.md

const AGENT_TERRITORY = {
  dolphin: {
    name: "Dr. Dolphin",
    role: "Medical Analyst",
    icon: "/assets/agents/dolphin.svg",
    color: "#5b7fff",
    columns: ["injury_status", "games_missed", "durability_score", "workload_flag"],
    panels: ["injury-report", "durability", "workload-sustainability", "workload-monitor"],
    bureau: ["roster-depth-health"],
    loading: [
      "checking the injury wire...",
      "reviewing practice reports...",
      "scanning soft-tissue histories...",
    ],
    empty: [
      "Clean bill of health. For now.",
      "No injuries to report. Enjoy it.",
      "Everyone's healthy. Suspicious.",
    ],
    errors: [
      "Medical records unavailable. Try again.",
      "The injury wire is down. Refreshing might help.",
    ],
  },
  hawkeye: {
    name: "Hawkeye",
    role: "Scout",
    icon: "/assets/agents/hawkeye.svg",
    color: "#2ec4b6",
    columns: ["target_share", "snap_pct", "snap_share", "route_participation", "wopr", "usage_trend"],
    panels: ["breakout-finder", "waiver-wire", "usage-trends", "rostership", "breakouts"],
    bureau: ["self-scout-usage", "roster-depth-trends"],
    loading: [
      "scanning the tape...",
      "reviewing snap counts...",
      "watching the all-22...",
    ],
    empty: [
      "Nothing worth your time right now.",
      "No signal. All noise.",
      "Tape's clean. No one popping.",
    ],
    errors: [
      "Film room offline. Try again.",
      "Can't pull the tape right now.",
    ],
  },
  bones: {
    name: "Bones",
    role: "Diplomat",
    icon: "/assets/agents/bones.svg",
    color: "#8b5cf6",
    columns: ["trade_value", "buy_sell", "contract_value"],
    panels: ["trade-values", "buy-low-sell-high", "trade-finder", "tradefinder", "tradevalues"],
    bureau: ["trade-finder", "trade-network", "pressure-map", "manager-profiles"],
    loading: [
      "reading the room...",
      "checking the market...",
      "working the phones...",
    ],
    empty: [
      "Market's quiet. Check back Wednesday.",
      "No deals worth making right now.",
      "Trade market's frozen. Sit tight.",
    ],
    errors: [
      "Trade desk is down. Try again.",
      "Can't reach the market right now.",
    ],
  },
  octo: {
    name: "Octo",
    role: "Quant",
    icon: "/assets/agents/octo.svg",
    color: "#e87422",
    columns: ["projection", "floor", "ceiling", "ppg", "efficiency", "composite_score", "ppo", "fantasy_points_ppr"],
    panels: ["monte-carlo", "projections", "efficiency", "aging-curves", "consistency", "vorp", "report-cards"],
    bureau: ["monte-carlo", "power-rankings", "strength-of-schedule"],
    loading: [
      "running the numbers...",
      "calculating confidence intervals...",
      "crunching the data...",
    ],
    empty: [
      "Insufficient data. Octo needs more.",
      "Not enough sample. Check back later.",
      "The model needs more games.",
    ],
    errors: [
      "The math broke. Refreshing might help.",
      "Numbers aren't loading. Try again.",
    ],
  },
  atlas: {
    name: "Atlas",
    role: "Historian",
    icon: "/assets/agents/atlas.svg",
    color: "#d44040",
    columns: ["career_stats", "yoy_delta", "player_comp"],
    panels: ["career-trajectories", "historical-comps", "season-recaps", "game-logs", "aging", "yoy"],
    bureau: ["manager-profiles-history", "transaction-history", "build-profiles"],
    loading: [
      "pulling the archives...",
      "searching the record books...",
      "dusting off the film...",
    ],
    empty: [
      "No precedent found. That's rare.",
      "The archives are empty here.",
      "History has nothing to say. Yet.",
    ],
    errors: [
      "Archives offline. Try again.",
      "Can't reach the record books.",
    ],
  },
  razzle: {
    name: "Razzle",
    role: "Chief of Staff",
    icon: "/assets/agents/razzle.svg",
    color: "#d97757",
    columns: [],
    panels: [],
    bureau: ["overview", "executive-summary"],
    loading: [
      "pulling film...",
      "getting the board ready...",
      "setting up the lab...",
    ],
    empty: [
      "The film room is empty. Add some players.",
      "Nothing here yet. Start exploring.",
      "No data to show. Try adjusting your filters.",
    ],
    errors: [
      "Film's not loading. Try again.",
      "Something's off. Razzle's looking into it.",
      "Hit a snag. Give it another shot.",
    ],
  },
};

// Reverse lookup: column key → agent id
const COLUMN_TO_AGENT = {};
for (const [agentId, config] of Object.entries(AGENT_TERRITORY)) {
  for (const col of config.columns) {
    COLUMN_TO_AGENT[col] = agentId;
  }
}

// Reverse lookup: panel id → agent id
const PANEL_TO_AGENT = {};
for (const [agentId, config] of Object.entries(AGENT_TERRITORY)) {
  for (const panel of config.panels) {
    PANEL_TO_AGENT[panel] = agentId;
  }
}

// Get a random item from an agent's loading/empty/error array
function getAgentCopy(agentId, type) {
  const agent = AGENT_TERRITORY[agentId] || AGENT_TERRITORY.razzle;
  const arr = agent[type];
  if (!arr || arr.length === 0) {
    return AGENT_TERRITORY.razzle[type]?.[0] || "";
  }
  return arr[Math.floor(Math.random() * arr.length)];
}

// Find which agent owns a column
function getColumnAgent(columnKey) {
  const agentId = COLUMN_TO_AGENT[columnKey];
  return agentId ? { id: agentId, ...AGENT_TERRITORY[agentId] } : null;
}

// Find which agent owns a panel
function getPanelAgent(panelId) {
  const agentId = PANEL_TO_AGENT[panelId];
  return agentId ? { id: agentId, ...AGENT_TERRITORY[agentId] } : null;
}

// Get loading text for a panel or general context
function getLoadingText(panelId) {
  const agentId = PANEL_TO_AGENT[panelId] || "razzle";
  return getAgentCopy(agentId, "loading");
}

// Get empty state text for a panel or general context
function getEmptyText(panelId) {
  const agentId = PANEL_TO_AGENT[panelId] || "razzle";
  return getAgentCopy(agentId, "empty");
}

// Get error text for a panel or general context
function getErrorText(panelId) {
  const agentId = PANEL_TO_AGENT[panelId] || "razzle";
  return getAgentCopy(agentId, "errors");
}

// Watermark with random character is defined in app.js (drawRazzleWatermark)
