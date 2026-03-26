<!-- PM: ready -->
---
id: DQ-468b
parent: 468 (Standalone Empty State Text Epic)
priority: P3
area: 3 standalone HTML pages
section: brand voice
type: consistency
status: open
---

# Replace hardcoded empty state text with razzleEmpty() — batch 2

**Files**: `frontend/vorp.html`, `frontend/reportcard.html`, `frontend/awards.html`

## What to do

In each file, find the hardcoded empty state string and replace with `razzleEmpty()` from app.js:

| Page | Find | Replace with |
|------|------|-------------|
| vorp.html | `"no VORP data found for this selection"` | `razzleEmpty()` |
| reportcard.html | `"no report card data found for this selection"` | `razzleEmpty()` |
| awards.html | `"no awards data found for this selection"` | `razzleEmpty()` |

## Accept when

- All 3 pages use `razzleEmpty()` for empty states
- Each page loads app.js before its own script
- Empty state still displays correctly when no data matches filters
