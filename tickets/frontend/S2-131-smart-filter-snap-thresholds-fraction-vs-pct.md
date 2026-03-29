---
id: S2-131
severity: S2
confidence: HIGH
category: football-accuracy
source: FUNC-029
status: OPEN
---

# Smart filter snap_share thresholds use fractions (0.5) but data is percentages (50)

## Root Cause

`frontend/lab.js:3544` — The SMART_FILTERS definitions for breakout, workhorses, and sleepers use snap_share thresholds in fraction format (e.g., `snap_share >= 0.5`) but the actual data values are percentages (e.g., `50.0`).

**Example:** A "Workhorse RB" filter requires `snap_share >= 0.65` but the data has `snap_share: 65.0`. The filter matches zero players because 65.0 >= 0.65 is always true (wrong direction — should be `>= 65`).

Actually, re-check: if snap_share data is already a percentage like 65.0, then `>= 0.65` would pass for ALL players, making the filter a no-op (doesn't filter anything).

## Fix

At `lab.js:3544`, change snap_share thresholds from fraction to percentage format:
- `snap_share >= 0.5` → `snap_share >= 50`
- `snap_share >= 0.65` → `snap_share >= 65`
- `snap_share >= 0.4` → `snap_share >= 40`

Verify what format snap_share is actually returned in from the API before fixing.

## Files to Change

- `frontend/lab.js:3544` — SMART_FILTERS snap_share values

## Accept When

1. "Workhorse" smart filter returns ~15-25 RBs (not 0 or all)
2. "Breakout" filter snap threshold is effective
3. Verify by comparing filtered count vs unfiltered count
