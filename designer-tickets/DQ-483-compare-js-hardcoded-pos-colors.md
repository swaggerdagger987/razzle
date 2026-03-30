---
id: DQ-483
title: compare.js has hardcoded POS_COLORS hex object — should use CSS vars
severity: P2
category: design-token-violation
file: frontend/compare.js
lines: 12, 88-89, 615
---

## Problem

`compare.js` line 12 defines a standalone `POS_COLORS` object with hardcoded hex values:
```javascript
POS_COLORS = { QB: "#5b7fff", RB: "#2ec4b6", WR: "#d97757", TE: "#8b5cf6" }
```

This duplicates the position color map already in `app.js` and bypasses `--pos-qb`/`--pos-rb`/`--pos-wr`/`--pos-te` CSS vars. Lines 88-89 and 615 use these hardcoded values with hardcoded fallbacks.

## Expected

Use `getComputedStyle()` to read CSS vars, or use the shared position color getter from `app.js`. Fallback hex values should match the CSS var defaults.

## Acceptance Criteria

- `compare.js` does not define its own `POS_COLORS` hex object
- Position colors come from CSS vars or the shared `app.js` helper
- `grep -n "5b7fff\|2ec4b6\|d97757\|8b5cf6" frontend/compare.js` returns zero results (outside comments)
