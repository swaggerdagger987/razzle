---
id: DQ-429
title: Monte Carlo simulation — no error recovery on empty roster, button state stuck
priority: P1
category: UX / error handling
page: league-intel.html (Bureau)
cycle: 54
---

## Problem

When a user runs the Monte Carlo league odds simulation with an empty roster or roster with no projectable players:

1. `runLeagueOdds()` checks `allPlayerIds.length === 0` (league-intel.html ~6972) and shows a vague error toast
2. The "Run Simulation" button may stay in disabled/loading state because the error path doesn't consistently reset button state
3. If `_mcRunSimulation()` receives empty distributions, it returns malformed results without catching the invalid state
4. The user sees "fumbled the simulation" but can't distinguish between:
   - API down (retry might help)
   - Missing roster data (structural issue, retry won't help)
   - No projections available for this roster (data gap)

## Why it matters

The Bureau is the conversion bridge from "cool free tool" to "I need this." A broken Monte Carlo simulation on first use (especially for users with incomplete rosters) makes the Bureau feel unreliable. Users blame Razzle rather than understanding the data gap.

## Fix

1. Add specific error messages: "no players with projections found — connect a league with active rosters" vs "simulation server error — try again"
2. Always reset button state in a `finally` block
3. Show a minimum roster size requirement before allowing simulation start

## Files
- `frontend/league-intel.html` — Monte Carlo section (~lines 6970-7050)
