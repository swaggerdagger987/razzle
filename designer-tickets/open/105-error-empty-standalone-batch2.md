<!-- PM: ready -->
---
id: DES-442d
parent: 442 (Error/Empty State Epic)
priority: P1
area: remaining standalone HTML pages
section: error handling
type: visual differentiation
status: open
depends_on: DES-442a, DES-442c
---

# Differentiate error vs empty in standalone pages (batch 2)

**Files**: All remaining standalone pages not covered by batch 1 — efficiency, consistency, stocks, opportunity, reportcard, awards, vorp, advantage, dualthreat, tdregression, snapefficiency, garbagetime, seasonpace, targetpremium, workload, leaders, stacks, streaks, etc.

Pages that already have retry buttons (weekly, targets, matchups) — verify they use the new `.panel-error` class for visual consistency.

## What to do

For each page's fetch handler:
- API failure → `.panel-error` with `razzleError()` + retry button
- Empty results → `.panel-empty` with hint text

## Accept when

- `grep -rn 'panel-error\|panel-empty' frontend/*.html` shows consistent usage
- No page uses the same class for both error and empty
- All error states have retry buttons

## Depends on

Ticket 102 / DES-442a (CSS classes), Ticket 104 / DES-442c (batch 1 done first as reference)
