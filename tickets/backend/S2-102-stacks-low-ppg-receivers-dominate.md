---
id: S2-102
severity: S2
confidence: HIGH
category: football-accuracy
source: functional-qa/flows.md flow #28 (P2: Jones+AlieCox 1.4 PPG at #3)
status: OPEN
---

# Stacks panel shows irrelevant low-PPG stacks at top

## Root Cause

`backend/live_data/tools.py:2097` — Stacks are sorted purely by Pearson correlation:

```python
key=lambda x: x["correlation"]
```

There is a `min_games=8` filter (`tools.py:2055-2066`) but NO minimum PPG filter for the receiver. A receiver with 1.4 PPG and high correlation ranks #3 because correlation is a statistical measure that doesn't account for volume or fantasy relevance.

Fantasy reality: Jones+AlieCox (1.4 PPG receiver) at #3 is useless information. Nobody is starting AlieCox. The stack feature should surface startable receivers who correlate with their QB.

## Fix

Add a minimum receiver PPG threshold. After computing `rec_ppg` at `tools.py:2081`, add:

```python
if rec_ppg < 5.0:
    continue
```

5.0 PPG is roughly replacement-level — any receiver below this is not roster-relevant.

## Files to Change

- `backend/live_data/tools.py` — around line 2081, add `rec_ppg >= 5.0` filter

## Accept When

1. No receiver with < 5.0 PPG appears in stacks results
2. Top stacks show QB + startable receivers (Mahomes+Rice, Allen+Shakir, etc.)
3. Correlation values are still correct for remaining stacks
4. Total results may decrease (fewer stacks returned) — that's correct behavior

## Do NOT Touch

- Pearson correlation calculation logic
- QB PPG filtering (QBs are already filtered by games)
- The min_games parameter
