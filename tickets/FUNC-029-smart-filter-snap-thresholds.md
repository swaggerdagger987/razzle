# FUNC-029: Smart filter snap_share thresholds use fraction format but data is percentage

## Severity: P2 — "This tool is annoying to use"

## Summary

The SMART_FILTERS object in lab.js uses fraction-format thresholds for `snap_share` (e.g., 0.5, 0.65, 0.3) but the actual `snap_share` data is stored as percentages (0-100). This means the snap_share filters are essentially no-ops — 0.5% snap share includes virtually everyone.

## Evidence

```
Data format: snap_share = 96.5 (percentage, 0-100)
Smart filter thresholds:
  breakout:   snap_share >= 0.5  → matches 99%+ of players (should be >= 50)
  workhorses: snap_share >= 0.65 → matches 99%+ of players (should be >= 65)
  sleepers:   snap_share >= 0.3  → matches 99%+ of players (should be >= 30)

API test (prod):
  age<=25 + snap_share>=0.5:  115 results (snap_share filter does nothing)
  age<=25 + snap_share>=50:    57 results (meaningful filter)
```

## Root Cause

`frontend/lab.js` SMART_FILTERS definition (~line 3544):
```javascript
breakout: {
    filters: [
      { key: "age", op: "lte", value: 25 },
      { key: "snap_share", op: "gte", value: 0.5 },   // ← 0.5% = useless
    ],
    minGP: 6,
},
workhorses: {
    filters: [
      { key: "snap_share", op: "gte", value: 0.65 },   // ← 0.65% = useless
      { key: "targets_per_game", op: "gte", value: 4 },
    ],
    minGP: 6,
},
sleepers: {
    filters: [
      { key: "snap_share", op: "gte", value: 0.3 },    // ← 0.3% = useless
      ...
    ],
},
```

## Fix

Change snap_share values from fractions to percentages:

```javascript
breakout:   { key: "snap_share", op: "gte", value: 50 },   // 50%
workhorses: { key: "snap_share", op: "gte", value: 65 },   // 65%
sleepers:   { key: "snap_share", op: "gte", value: 30 },   // 30%
```

## Impact

- Breakout Candidates includes too many players (115 vs 57 with correct threshold)
- Workhorses filter adds no value (snap_share doesn't restrict)
- Sleepers are too broad

The smart filters are the CEO review's "viral content engine" — they should show curated, focused results, not the entire player pool.

## Files
- `frontend/lab.js:3544-3590` (SMART_FILTERS object)
