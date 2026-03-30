<!-- PM: ready -->
---
id: DQ-468a
parent: 468 (Standalone Empty State Text Epic)
priority: P3
area: 3 standalone HTML pages
section: brand voice
type: consistency
status: open
---

# Replace hardcoded empty state text with razzleEmpty() — batch 1

**Files**: `frontend/breakouts.html`, `frontend/efficiency.html`, `frontend/consistency.html`

## What to do

In each file, find the hardcoded empty state string and replace with `razzleEmpty()` from app.js:

| Page | Find | Replace with |
|------|------|-------------|
| breakouts.html | `"no breakout candidates found for this filter"` | `razzleEmpty()` |
| efficiency.html | `"no efficiency data found for this selection"` | `razzleEmpty()` |
| consistency.html | `"no consistency data found for this selection"` | `razzleEmpty()` |

## Accept when

- All 3 pages use `razzleEmpty()` for empty states
- Each page loads app.js before its own script
- Empty state still displays correctly when no data matches filters
