# DQ-468: 9 Standalone Pages Hardcode Empty State Text Instead of razzleEmpty()

**Priority**: P3
**Category**: Brand Voice / Consistency
**Affects**: 9 standalone panel pages

## Problem

app.js provides `razzleEmpty()` for personality-consistent empty states. Only garbagetime.html uses it. The other 9 pages hardcode generic strings like "no X data found for this selection" — missing the brand voice.

## Pages with Hardcoded Empty States

| Page | Hardcoded Text |
|------|---------------|
| breakouts.html | "no breakout candidates found for this filter" |
| efficiency.html | "no efficiency data found for this selection" |
| consistency.html | "no consistency data found for this selection" |
| vorp.html | "no VORP data found for this selection" |
| reportcard.html | "no report card data found for this selection" |
| awards.html | "no awards data found for this selection" |
| stocks.html | "no stock watch data found for this selection" |
| opportunity.html | "no opportunity share data found for this selection" |
| dualthreat.html | "no dual-threat players found for this filter" |

## Fix

Replace each hardcoded string with `razzleEmpty()` call from app.js (or `razzleEmpty('custom context')` if the function accepts a parameter). This gives personality like "the film room came up empty..." instead of generic copy.

## Acceptance

Grep `"no .* found for this` across standalone HTML files returns 0 matches.
