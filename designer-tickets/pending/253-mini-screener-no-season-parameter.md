# DES-253: Mini-screener fetch omits season parameter

**Priority**: P2
**Area**: index.html (home page)
**Cycle**: 24

## Problem

The home page mini-screener fetches at line 1018:

```js
fetch('/api/players?limit=60&sort=ppg&order=desc')
```

No `&season=` parameter. It relies entirely on the backend's default season logic (`_current_nfl_season()` in live_data). During the NFL offseason (February-August), the default season may return the previous year's data with no indication to the user that they're looking at 2025 stats in 2026.

The Lab screener explicitly includes `season=2025` in queries. The home page doesn't.

## Evidence

- `index.html:1018` — fetch URL has no season parameter
- `lab.js:285-364` — Lab screener builds URL with explicit `season` from state
- Backend `_current_nfl_season()` returns 2025 during offseason, 2026 once season starts
- No "2025 Season" label anywhere in the mini-screener to indicate which data is shown

## Fix

1. Include explicit season parameter: `fetch('/api/players?limit=60&sort=ppg&order=desc&season=2025')`
2. Better: fetch season dynamically and show a label: `<span class="mini-season-label">2025 Season</span>`

## Why This Matters

First impressions. A visitor from Twitter sees "Patrick Mahomes — 22.4 PPG" with no context on which season. If the season is wrong or unclear, the data looks stale. Dynasty managers verify claims — "this says 22 PPG but he averaged 18 this year" is a credibility-destroying first interaction.
