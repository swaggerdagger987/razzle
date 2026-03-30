---
id: DES-291
title: Player comparison selections (selectedPlayers) not serialized to URL
severity: P2
category: UX
page: lab.html
---

## What's Wrong

When users select multiple players for comparison (checkboxes in the Screener), the selection is stored in `state.selectedPlayers` but is NOT included in `saveStateToURL()`. This means:

- User selects 4 RBs for comparison → clicks "Share URL" → recipient sees empty selection
- User refreshes the page → selection is lost
- Pinned players ARE serialized (line 3848: `params.set("pins", ...)`), but selected players are not

## Where

- `frontend/lab.js` lines 3826-3876: `saveStateToURL()` — `selectedPlayers` is absent
- `frontend/lab.js` line 993: `selectedPlayers: []` — defined in state
- `frontend/lab.js` line 3848: `pinnedPlayers` IS serialized — inconsistent

## Fix

Add selectedPlayers to URL state:
```js
if (state.selectedPlayers.length) {
  params.set("sel", state.selectedPlayers.map(p => p.player_id).join(","));
}
```

On restore, re-hydrate from `?sel=` parameter by looking up player data.

## Evidence

`saveStateToURL()` serializes: universe, position, search, sort, filters, teams, minGP, heat, percentile, dataBars, leaders, tiers, density, groups, summary, tags, pins, diff, season, week, columns. But NOT `selectedPlayers`. The comparison workflow (bulk bar at lines 2645-2705) relies on this state.
