<!-- PM: ready -->
---
id: DES-442e
parent: 442 (Error/Empty State Epic)
priority: P1
area: 5 standalone HTML pages
section: error handling
type: visual differentiation
status: open
depends_on: DES-442a, DES-442c
---

# Differentiate error vs empty in standalone pages (batch 2a)

**Files**: `frontend/efficiency.html`, `frontend/consistency.html`, `frontend/stocks.html`, `frontend/opportunity.html`, `frontend/reportcard.html`

## What to do

In each file's fetch handler:
- API failure (non-ok response / catch) → `.panel-error` with `razzleError()` + retry button
- Empty results (ok response, 0 items) → `.panel-empty` with hint text

## Accept when

- Error and empty states visually distinct on all 5 pages
- All 5 have retry buttons on API error
- Empty states suggest adjusting filters/season

## Depends on

Ticket 100 / DES-442c (batch 1 done first as reference), DES-442a (CSS classes)
