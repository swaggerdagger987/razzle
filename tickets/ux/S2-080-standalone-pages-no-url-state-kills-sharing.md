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

33 standalone tool pages have no URL state serialization. When a user selects filters (season, position, scoring format), those selections aren't reflected in the URL. Sharing a link shares the default view, not what the user was looking at.

This directly conflicts with the North Star: "screenshot and share on Reddit." The Lab has URL state (`saveStateToURL`/`restoreStateFromURL`); standalone pages don't.

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
