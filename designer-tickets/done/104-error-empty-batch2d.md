<!-- PM: ready -->
---
id: DES-442h
parent: 442 (Error/Empty State Epic)
priority: P1
area: remaining standalone HTML pages
section: error handling
type: visual differentiation + verification
status: open
depends_on: DES-442a, DES-442c, DES-442e, DES-442f, DES-442g
---

# Differentiate error vs empty in remaining pages (batch 2d) + verify all

**Files**: `frontend/leaders.html`, `frontend/stacks.html`, `frontend/streaks.html`

Also verify pages that already have retry buttons (weekly, targets, matchups) use the new `.panel-error` class.

## What to do

1. Apply error/empty pattern to leaders, stacks, streaks
2. Verify existing retry pages use `.panel-error` class
3. Final sweep:
   ```bash
   grep -rn 'panel-error\|panel-empty' frontend/*.html
   ```
   Confirm consistent usage across all standalone pages.

## Accept when

- `grep -rn 'panel-error\|panel-empty' frontend/*.html` shows consistent usage
- No page uses the same class for both error and empty
- All error states have retry buttons

## Depends on

All prior error/empty batches (100, 101, 102, 103)
