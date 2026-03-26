<!-- PM: ready -->
---
id: DQ-468c
parent: 468 (Standalone Empty State Text Epic)
priority: P3
area: 3 standalone HTML pages
section: brand voice
type: consistency
status: open
---

# Replace hardcoded empty state text with razzleEmpty() — batch 3

**Files**: `frontend/stocks.html`, `frontend/opportunity.html`, `frontend/dualthreat.html`

## What to do

In each file, find the hardcoded empty state string and replace with `razzleEmpty()` from app.js:

| Page | Find | Replace with |
|------|------|-------------|
| stocks.html | `"no stock watch data found for this selection"` | `razzleEmpty()` |
| opportunity.html | `"no opportunity share data found for this selection"` | `razzleEmpty()` |
| dualthreat.html | `"no dual-threat players found for this filter"` | `razzleEmpty()` |

## Accept when

- All 3 pages use `razzleEmpty()` for empty states
- Each page loads app.js before its own script
- Empty state still displays correctly when no data matches filters
