---
id: S3-106
severity: S3
confidence: MEDIUM
category: frontend
source: DQ-425
status: OPEN
---

# Compare.js and player.js define duplicate showToast() — bypasses design system

## Root Cause

Both `compare.js` and `player.js` define their own `showToast()` functions instead of using the global `_showToast()` from `app.js`. These duplicates create their own DOM elements and miss any design system updates (e.g., `role="status"` for a11y, consistent styling).

**File**: `frontend/compare.js:890` — local `showToast()` definition
**File**: `frontend/player.js:804` — local `showToast()` definition
**File**: `frontend/app.js:613` — global `_showToast()` (canonical)

## Fix

Remove the local `showToast()` definitions from compare.js and player.js. Replace all calls with `_showToast()` from app.js (which is already loaded on both pages).

## Acceptance Criteria

- [ ] compare.js uses `_showToast()` from app.js (no local definition)
- [ ] player.js uses `_showToast()` from app.js (no local definition)
- [ ] Toast styling and a11y attributes are consistent across all pages
