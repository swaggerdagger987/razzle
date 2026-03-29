---
id: S2-028
severity: S2
category: backend
title: Prospects RPS methodology ignores college production — weights are athleticism 40% + draft capital 35% + size 25%
source: deep-audit
status: open
---

## Problem

RPS (Razzle Prospect Score) ignores college production entirely. A combine freak with day 3 draft capital scores highly despite poor production, while productive players like Davante Adams (second round, average athleticism, elite production) would be undervalued.

## Root Cause

**`backend/live_data/prospects.py:857-859`** — RPS composite formula:
```python
# RPS composite: athletic 40% + draft capital 35% + size 25%
rps = round(athletic_avg * 0.4 + draft_capital * 0.35 + size_score * 0.25, 1)
```

**Fallback (no combine data)** — `backend/live_data/prospects.py:862`:
```python
rps = round(draft_capital * 0.55 + size_score * 0.3, 1)
```

**Actual weights** (corrected from deep audit's 60/30/10 claim):
- Athleticism: **40%** (avg combine metric percentile)
- Draft Capital: **35%** (pick 1=100, pick 32=75, pick 64=55, pick 256=20, undrafted=20)
- Size: **25%** (position-relative weight percentile)
- Production: **0%**

The methodology is transparent on the page, but the weighting is debatable for a dynasty audience that values production data.

## Fix

Consider adding a production component (college PPG, dominator rating, breakout age) to the RPS formula. Possible rebalancing:
- Athleticism: 35%
- Draft Capital: 25%
- Production: 25%
- Size: 15%

Or add a separate "Production Score" column alongside RPS for users who want that lens.

## Accept When

- Either production is factored into RPS, or a separate production metric is shown alongside RPS
- The methodology chips on the prospects page reflect the actual weights
