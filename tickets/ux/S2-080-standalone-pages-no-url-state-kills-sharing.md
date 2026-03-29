---
id: S2-080
severity: S2
confidence: HIGH
category: ux-flow
source: DQ-443
status: OPEN
---

# 33 standalone pages lack shareable URL state — kills Reddit sharing

## Root Cause

33 standalone tool pages have no URL state serialization. No `history.replaceState`, no `URLSearchParams`, no state restoration from URL params. Sharing a link shares the default view, not what the user was looking at.

**Representative missing state** (verified by code search):
- `frontend/matchups.html:746` — season select change listener, no `history.replaceState`
- `frontend/matchups.html:734` — position tab click listener, no URL state update
- `frontend/weekly.html` — season/position changes not serialized to URL
- `frontend/consistency.html` — position tab changes not serialized to URL

**Reference implementation** (pages that DO have URL state):
- `frontend/aging.html:763,774,816` — uses `savePageState()`/`restorePageState()`
- `frontend/seasonpace.html:208,216` — uses `savePageState()`
- `frontend/lab.js` — `saveStateToURL()`/`restoreStateFromURL()`

This directly conflicts with the North Star: "screenshot and share on Reddit." The Lab has URL state; standalone pages don't.

## Affected Pages

tradevalues.html, rankings.html, tiers.html, dashboard.html, aging.html, airyards.html, awards.html, breakouts.html, buysell.html, cheatsheet.html, consistency.html, efficiency.html, leaders.html, matchups.html, opportunity.html, redzone.html, reportcard.html, scarcity.html, scoring.html, stocks.html, targets.html, usage.html, weekly.html, yoy.html, vorp.html, auction.html, rosterbuilder.html, drops.html, gamescript.html, seasonpace.html, snapefficiency.html, targetpremium.html, garbagetime.html

## Fix

Each page should serialize key state (season, position, scoring format) to URL params on change, and restore on load:
```js
function saveToURL() {
  const p = new URLSearchParams();
  if (season) p.set('season', season);
  if (position) p.set('pos', position);
  history.replaceState(null, '', '?' + p.toString());
}
```

## Acceptance Criteria

- Filter selections reflected in URL on all standalone pages
- Shared URLs restore the sender's view
