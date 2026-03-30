---
id: DQ-222
title: Demo league card shows hardcoded "2024 Season" — stale year in demo data
priority: P1
category: content-accuracy
status: open
cycle: 32
---

## Problem

The Bureau of Intelligence demo/placeholder league card in league-intel.html displays "2024 Season" as hardcoded text. It's March 2026. A first-time visitor connecting their Sleeper account sees stale demo data from two years ago, which undermines trust in the product's freshness.

Also: demo manager name is "DynastyKing2024" — the year in the name makes it look even more dated.

## Evidence

- `league-intel.html:7380` — `'12-team Dynasty Superflex | 2024 Season'`
- `league-intel.html:7364` — `{name: "DynastyKing2024", record: "9-4", ...}`

## Fix

Make the demo season dynamic:
```javascript
const demoSeason = new Date().getMonth() >= 8 ? new Date().getFullYear() : new Date().getFullYear() - 1;
// Use demoSeason instead of hardcoded "2024"
```
And rename demo manager to something timeless like "DynastyKing" or "TigerKing".

## Files
- `frontend/league-intel.html:7364, 7380`
