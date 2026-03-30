# DQ-123: addEventListener stacking in lab-panels.js — memory leak on panel reloads

**Priority**: P2 — HIGH
**Category**: Performance / Memory
**Scope**: frontend/lab-panels.js

## Problem

195 addEventListener() calls in lab-panels.js. Many are inside panel load functions that execute on every panel switch or data refresh. Each call adds a NEW listener without removing the old one. After switching between 10 panels, you have 10x the event listeners.

## Top 5 worst offenders

1. **loadRankings()** — 3 listeners (season/filter change) re-added every panel load
2. **loadTradeValues()** — 4 listeners on season/position/search inputs
3. **loadAuctionValues()** — 4 listeners (budget slider, roster input, season, search)
4. **loadCheatSheet()** — 2 listeners on season/format selectors
5. **loadBreakouts()** — 3 listeners on position/season selectors

## Impact

- Memory leak: each listener holds a closure reference to panel DOM
- Double-firing: clicking a filter triggers the handler N times (once per panel load)
- Performance degradation during long sessions (user exploring many panels)

## Fix

Two approaches (pick one):

**Option A** — Named function + removeEventListener before add:
```js
function onSeasonChange() { loadRankings(); }
seasonSel.removeEventListener('change', onSeasonChange);
seasonSel.addEventListener('change', onSeasonChange);
```

**Option B** — Event delegation (preferred for scale):
Add one listener on the panel container that delegates based on event.target, rather than individual listeners per input element.

Option B is more work but eliminates the problem structurally for all 195 instances.
