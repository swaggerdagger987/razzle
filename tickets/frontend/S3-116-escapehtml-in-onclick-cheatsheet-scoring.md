---
id: S3-116
severity: S3
confidence: MEDIUM
category: security
source: functional-qa re-audit s18
status: OPEN
---

# escapeHtml used in single-quoted onclick attributes (cheatsheet, scoring)

## Root Cause

Two pages use `escapeHtml()` inside single-quoted onclick JS strings instead of `escapeAttr()`:

1. **`frontend/cheatsheet.html:453`** — Player click handler uses `escapeHtml(id)` in a single-quoted onclick attribute. `escapeHtml` converts `"` → `&quot;` and `<` → `&lt;` but does NOT escape single quotes. If a player ID contained a single quote, it would break out of the JS string.

2. **`frontend/scoring.html:491`** — Same pattern.

**Practical risk: near-zero** — nflverse player IDs are digits and dashes (e.g., `00-0033280`), never contain quotes. However, the pattern is inconsistent with the `escapeAttr()` + event delegation pattern used everywhere else in the codebase.

## Fix

Replace `escapeHtml()` with `escapeAttr()` in the onclick attribute, or better yet, switch to the event delegation pattern (data attributes + addEventListener) used in the rest of the codebase.

## Files to Change

- `frontend/cheatsheet.html:453` — escapeHtml → escapeAttr or event delegation
- `frontend/scoring.html:491` — same

## Accept When

1. Both files use escapeAttr() or event delegation pattern
2. Click handlers still work correctly
