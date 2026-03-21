# FUNC-043: Breakout RBS Score IEEE 754 Floating Point Artifacts

**Severity**: P2
**Flow**: 29 (Breakouts)
**Found**: Session 42 (2026-03-21)
**Status**: OPEN

## Description

22 out of 50 breakout candidates have IEEE 754 floating point artifacts in the `rbs_score` field. The raw float values are displayed instead of cleanly rounded numbers.

## Examples

| Player | rbs_score (raw) | Expected |
|--------|----------------|----------|
| Jerry Jeudy | 26.200000000000003 | 26.2 |
| Arian Smith | 24.200000000000003 | 24.2 |
| Kaleb Johnson | 21.799999999999997 | 21.8 |
| Matthew Golden | 21.799999999999997 | 21.8 |

## Root Cause

`analytics.py:756` — `p["rbs_score"] = max(0, gap + age_bonus)`

The `age_bonus` is computed from `(28 - age) * 2` where `age` is a float (e.g., 22.6). In IEEE 754:
- `28 - 22.6 = 5.3999999999999995` (not 5.4)
- `5.3999999999999995 * 2 = 10.799999999999999`
- `gap + 10.799999999999999 = 21.799999999999997`

## Fix

Round the result at line 756:
```python
p["rbs_score"] = round(max(0, gap + age_bonus), 1)
```

Same class of bug as FUNC-040 (fantasy points ROUND fix), but in Python computation rather than SQL.

## Verification

After fix: `curl /api/breakout-candidates?season=2025&limit=50` — all `rbs_score` values should have at most 1 decimal place, no trailing 999/001 artifacts.
