---
id: S2-028
severity: S2
category: backend
title: Prospects RPS methodology weights athleticism 60% + draft capital 30% — ignores college production
source: deep-audit
status: open
---

## Problem

RPS (Razzle Prospect Score) weights: athleticism 60%, draft capital 30%, size 10%. Production (college stats) is weighted at 0%. This means a combine freak with day 3 draft capital scores highly despite poor production, while productive players like Davante Adams (second round, average athleticism, elite production) would be undervalued.

## Root Cause

RPS calculation in the prospects/big board backend endpoint — weights are:
- Athleticism: 60%
- Draft Capital: 30%
- Size: 10%
- Production: 0%

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
