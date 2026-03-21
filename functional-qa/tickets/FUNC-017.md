# FUNC-017: Player profile breakout badge uses raw season totals instead of PPG

**Severity**: P1
**Flow**: Player Profile (flow 13)
**Status**: OPEN

## Problem

The player profile breakout badge (`player.js:75-89`) calculates year-over-year percentage change using **raw `fantasy_points_ppr` season totals**, not per-game averages (PPG). This causes injury-recovery seasons to appear as massive "breakouts."

## Evidence

Christian McCaffrey (00-0033280) shows **"BREAKOUT +772% (2025)"**

- 2024: 47.8 total PPR in ~4 games (injured) → 11.9 PPG
- 2025: ~416.5 total PPR in 17 games (healthy) → 24.5 PPG
- Raw total calculation: (416.5 - 47.8) / 47.8 = **+770%** (injury recovery, not breakout)
- PPG calculation: (24.5 - 11.9) / 11.9 = **+106%** (still a big jump but more honest)

A dynasty veteran would NEVER call this a breakout. CMC has been elite for 8 years. He got healthy.

## Root Cause

```javascript
// player.js:75-89
const prev = sorted[i - 1].fantasy_points_ppr || 0;  // RAW TOTALS
const curr = sorted[i].fantasy_points_ppr || 0;       // RAW TOTALS
if (prev > 20) {  // 20 total PPR = ~1.2 PPG over 17 weeks = barely played
```

Two compounding issues:
1. Uses `fantasy_points_ppr` (season totals) instead of `ppg` — conflates games played with production
2. Threshold `prev > 20` is too low — allows 4-game injury seasons as a comparison base

## Impact

- Misleading breakout badges on profiles of injury-recovery players
- Undermines trust: any dynasty veteran will immediately question "+772%"
- The separate Breakouts panel (`/breakouts.html`) uses proper RBS scoring and is NOT affected
- Only the player profile badge has this bug

## Suggested Fix

Replace raw totals with PPG and add a minimum games threshold:

```javascript
const prevPPG = sorted[i - 1].ppg || 0;
const currPPG = sorted[i].ppg || 0;
const prevGP = sorted[i - 1].games_played || 0;
if (prevPPG > 3 && prevGP >= 6) {  // min 6 games + 3 PPG floor
  const pct = ((currPPG - prevPPG) / prevPPG) * 100;
```

This would give CMC +106% (still notable) instead of the misleading +772%.

## Files

- `frontend/player.js:75-89`
