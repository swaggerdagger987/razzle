---
id: S2-107
severity: S2
confidence: MEDIUM
category: football-accuracy
source: functional-qa/flows.md flow #21 (P2: S-tier still bloated, 84 players)
status: OPEN
---

# Tiers panel S-tier has 84 players — should be elite-only (10-15)

## Root Cause

The tier assignment thresholds are too generous for S-tier. The exact definition is at **`backend/live_data/dynasty.py:1314-1321`**:

```python
_TIER_BREAKS = [
    (80, "S", "Elite — untouchable dynasty cornerstones"),
    (65, "A", "Blue Chip — premium assets with staying power"),
    (50, "B", "Solid — reliable starters with upside"),
    (35, "C", "Flex — startable but replaceable"),
    (20, "D", "Depth — roster filler with some value"),
    (0, "F", "Cut Bait — minimal dynasty value"),
]
```

The S-tier threshold of **80** captures 84 players because the trade value composite (production 50% + age 30% + scarcity 20%) distributes broadly. With 84 in S-tier, the "untouchable" label is meaningless.

**Tier assignment logic** — `backend/live_data/dynasty.py:1380`:
```python
for threshold, key, _ in _TIER_BREAKS:
```
Iterates thresholds in descending order, assigning first match.

## Fix

Raise S-tier threshold from 80 to ~92 at `dynasty.py:1315`:

Current: `(80, "S", "Elite — untouchable dynasty cornerstones")`
Proposed: `(92, "S", "Elite — untouchable dynasty cornerstones")`

Also adjust A(75), B(55) to rebalance distribution.

## Files to Change

- `backend/live_data/dynasty.py:1314-1321` — `_TIER_BREAKS` constant

## Accept When

1. S-tier contains 10-20 players max
2. A-tier contains ~30-50 players
3. All 4 positions represented in S-tier (not just RBs)
4. Players at S-tier cutoff are genuinely elite dynasty assets (top-5 at position)

## Do NOT Touch

- D/F tier thresholds (these are fine for replacement-level)
- The trade value composite formula
- Frontend tier display logic
