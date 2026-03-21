// ─── Agent Nudge System — Layer 3: Alive (Elite) ────────────────────
// Cross-product agent nudges that stitch Lab, Bureau, and Situation Room.
// Elite-gated. Max 1 per page, max 5 per session. Dismissible.

// ─── Nudge Definitions ──────────────────────────────────────────────
var AGENT_NUDGES = [
  // Lab → Bureau
  {
    id: "dolphin-injury-to-bureau",
    agent: "dolphin",
    source_page: "lab",
    message: "spotted an injury flag on your roster",
    link: "/league-intel.html",
    link_label: "check roster health",
    requires_league: true,
  },
  {
    id: "hawkeye-usage-to-bureau",
    agent: "hawkeye",
    source_page: "lab",
    message: "usage trend changed on a key player",
    link: "/league-intel.html",
    link_label: "see self-scout",
    requires_league: true,
  },
  {
    id: "bones-value-to-trade",
    agent: "bones",
    source_page: "lab",
    message: "found a trade value mismatch",
    link: "/lab.html?panel=tradefinder",
    link_label: "open trade finder",
  },
  {
    id: "octo-projection-shift",
    agent: "octo",
    source_page: "lab",
    message: "projections shifted since last week",
    link: "/lab.html?panel=efficiency",
    link_label: "check the numbers",
  },
  {
    id: "atlas-career-comp",
    agent: "atlas",
    source_page: "lab",
    message: "this player's trajectory looks familiar",
    link: "/lab.html?panel=aging",
    link_label: "see the history",
  },
  // Bureau → Lab
  {
    id: "bones-roster-gap",
    agent: "bones",
    source_page: "bureau",
    message: "your roster has a positional gap",
    link: "/lab.html?panel=breakouts",
    link_label: "find breakout candidates",
    requires_league: true,
  },
  {
    id: "hawkeye-waiver-target",
    agent: "hawkeye",
    source_page: "bureau",
    message: "someone on your waiver wire is trending up",
    link: "/lab.html?panel=waivers",
    link_label: "check waivers",
    requires_league: true,
  },
  {
    id: "octo-odds-concern",
    agent: "octo",
    source_page: "bureau",
    message: "your odds shifted this week",
    link: "/lab.html?panel=consistency",
    link_label: "check consistency",
    requires_league: true,
  },
  // Lab/Bureau → Situation Room
  {
    id: "razzle-complex-decision",
    agent: "razzle",
    source_page: "lab",
    message: "this looks like a decision your agents should weigh in on",
    link: "/agents.html",
    link_label: "ask the team",
  },
  {
    id: "razzle-brief-ready",
    agent: "razzle",
    source_page: "bureau",
    message: "Razzle has a take on your roster moves",
    link: "/agents.html",
    link_label: "get the briefing",
    requires_league: true,
  },
  // Bureau → Bureau
  {
    id: "bones-manager-behavior",
    agent: "bones",
    source_page: "bureau",
    message: "a rival manager's trade pattern just changed",
    link: "/league-intel.html",
    link_label: "see manager profiles",
    requires_league: true,
  },
  {
    id: "atlas-history-lesson",
    agent: "atlas",
    source_page: "bureau",
    message: "this matchup has historical precedent",
    link: "/lab.html?panel=yoy",
    link_label: "see the archives",
  },
];

// ─── Session State ──────────────────────────────────────────────────
var _nudgeSessionKey = "razzle_nudge_session";
var _nudgeDismissKey = "razzle_nudge_dismissed";

function _getNudgeCount() {
  try { return parseInt(sessionStorage.getItem(_nudgeSessionKey) || "0", 10); } catch(e) { return 0; }
}
function _incrementNudgeCount() {
  try { sessionStorage.setItem(_nudgeSessionKey, String(_getNudgeCount() + 1)); } catch(e) {}
}
function _getDismissed() {
  try { return JSON.parse(sessionStorage.getItem(_nudgeDismissKey) || "[]"); } catch(e) { return []; }
}
function _dismissNudge(id) {
  var dismissed = _getDismissed();
  if (dismissed.indexOf(id) === -1) dismissed.push(id);
  try { sessionStorage.setItem(_nudgeDismissKey, JSON.stringify(dismissed)); } catch(e) {}
}

// ─── Render ─────────────────────────────────────────────────────────
function renderAgentNudge(containerId, nudge) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var agent = (typeof AGENT_TERRITORY !== "undefined") ? AGENT_TERRITORY[nudge.agent] : null;
  if (!agent) return;

  var esc = typeof escapeHtml === "function" ? escapeHtml : function(s) { return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); };
  var safeColor = /^#[0-9a-fA-F]{3,8}$/.test(agent.color) ? agent.color : "var(--orange)";
  var safeIcon = agent.icon && agent.icon.indexOf("javascript:") === -1 ? esc(agent.icon) : "";
  var safeLink = nudge.link && nudge.link.indexOf("javascript:") === -1 ? esc(nudge.link) : "#";

  var el = document.createElement("div");
  el.className = "agent-nudge";
  el.style.cssText = "display:flex; align-items:center; gap:8px; padding:8px 14px; margin:8px 0; border:2px solid " + safeColor + "; border-radius:8px; background:var(--bg-card); font-size:13px; animation:nudgeFadeIn 0.4s ease-out;";
  el.innerHTML =
    '<img src="' + safeIcon + '" width="16" height="16" alt="" style="flex-shrink:0;">' +
    '<span style="font-family:var(--font-mono); font-size:11px; font-weight:700; color:' + safeColor + ';">' + esc(agent.name) + '</span>' +
    '<span style="font-family:var(--font-hand); font-size:14px; flex:1;">' + esc(nudge.message) + '</span>' +
    '<a href="' + safeLink + '" style="font-family:var(--font-mono); font-size:11px; color:var(--orange); text-decoration:none; white-space:nowrap;">' + esc(nudge.link_label) + ' &rarr;</a>' +
    '<button style="background:none; border:none; cursor:pointer; font-size:14px; color:var(--ink-light); padding:0 2px;" title="Dismiss" aria-label="Dismiss nudge">&times;</button>';

  el.querySelector("button").addEventListener("click", function() {
    _dismissNudge(nudge.id);
    el.style.opacity = "0";
    el.style.transition = "opacity 0.3s";
    setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 300);
  });

  container.prepend(el);
  _incrementNudgeCount();
}

// ─── Check & Trigger ────────────────────────────────────────────────
function checkNudges(pageName, containerId) {
  // Elite-only
  if (typeof getUserTierInfo !== "function") return;
  var tier = getUserTierInfo();
  if (!tier || tier.tier !== "elite") return;

  // Session cap: max 5
  if (_getNudgeCount() >= 5) return;

  // Already showing a nudge on this page
  var container = document.getElementById(containerId);
  if (!container || container.querySelector(".agent-nudge")) return;

  var dismissed = _getDismissed();
  var hasLeague = false;
  try { hasLeague = !!localStorage.getItem("razzle_sleeper_user"); } catch(e) {}

  // Determine current page type
  var pageType = "lab";
  if (pageName === "league-intel" || pageName === "bureau") pageType = "bureau";
  if (pageName === "agents") pageType = "agents";

  // Filter eligible nudges
  var eligible = AGENT_NUDGES.filter(function(n) {
    if (dismissed.indexOf(n.id) !== -1) return false;
    if (n.requires_league && !hasLeague) return false;
    if (n.source_page !== pageType) return false;
    return true;
  });

  if (eligible.length === 0) return;

  // Pick a random one
  var nudge = eligible[Math.floor(Math.random() * eligible.length)];
  renderAgentNudge(containerId, nudge);
}
