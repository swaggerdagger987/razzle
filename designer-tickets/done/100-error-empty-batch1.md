<!-- PM: ready -->
---
id: DES-442c
parent: 442 (Error/Empty State Epic)
priority: P1
area: 5 standalone HTML pages
section: error handling
type: visual differentiation
status: open
depends_on: DES-442a
---

# Differentiate error vs empty in standalone pages (batch 1)

**Files**: `frontend/breakouts.html`, `frontend/aging.html`, `frontend/buysell.html`, `frontend/scarcity.html`, `frontend/yoy.html`

## What to do

In each file's fetch handler:
- API failure (non-ok response / catch) → `.panel-error` with `razzleError()` + retry button
- Empty results (ok response, 0 items) → `.panel-empty` with hint text

These 5 pages were also flagged in DES-444 as missing retry buttons — this ticket covers that.

## Accept when

- Error and empty states visually distinct on all 5 pages
- All 5 have retry buttons on API error
- Empty states suggest adjusting filters/season

## Depends on

Ticket 102 / DES-442a (CSS classes)
