# FUNC-015: Screener dynasty_value and Trade Value Chart trade_value use different formulas

**Severity**: P2
**Flow**: Trade Values (flow 19), Screener (flow 1)
**Status**: OPEN

## Problem

The screener's `dynasty_value` field and the Trade Value Chart's `trade_value` field use **completely different formulas**, producing significantly different numbers for the same player. Users see conflicting valuations with no explanation.

## Two Different Formulas

### Screener DVS (`_enrich_with_dynasty_value` in core.py:463)
```
production = min(100, ppg * 4.0)   # 25 PPG = 100
DVS = production * age_multiplier  # simple ppg × age curve
```

### Trade Value Chart (`compute_trade_value` in core.py:841)
```
production = (ppg / elite_ppg) * 100   # position-specific elite threshold
age = peak + decay curve               # position-specific peak/decay
scarcity = position multiplier * 100   # RB=1.15, WR=1.0, TE=0.90
composite = prod*0.50 + age*0.30 + scarcity*0.20
final = soft_ceiling(composite)        # log compression above 90
```

## Evidence

| Player | Screener dynasty_value | Trade Value Chart trade_value |
|--------|----------------------|------------------------------|
| Trey McBride (TE, 18.6 PPG, 26.3yr) | 74.4 | 95.6 |
| Bijan Robinson (RB, 21.8 PPG, 24.1yr) | 87.2 | 95.4 |
| Saquon Barkley (RB, 14.5 PPG, 29.1yr) | ~58 (est) | 65.6 |

McBride: ranked higher than Robinson on Trade Value Chart but lower in screener.

## Impact

- P2 not P0: the numbers aren't "wrong" — they're just two different metrics with similar-sounding names
- Dynasty veterans will immediately notice the discrepancy and lose trust
- No label in the screener explains that "dynasty_value" is a simpler metric than the Trade Values page
- Users trying to cross-reference screener DVS with Trade Values will be confused

## Suggested Fix

Option A: **Unify** — replace screener's simple DVS with `compute_trade_value()` so both pages agree. This is the simplest fix.

Option B: **Rename & explain** — rename screener column to "DVS" or "Simple Value" and add tooltip explaining it's a quick estimate vs the full trade value composite.

Option C: **Keep both but document** — add a methodology note on the Trade Values page explaining the formula components.

Recommendation: Option A. Users expect consistent numbers. One formula, one source of truth.

## Not Affected

- The trade value chart formula itself is mathematically correct
- Trade Finder uses the correct `compute_trade_value()` (consistent with chart)
- Dynasty Rankings and Tier List use `compute_trade_value()` (consistent with chart)
- Only the screener's `dynasty_value` column is the outlier
