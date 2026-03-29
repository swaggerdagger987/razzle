# S2-023: Compare page flashes "pulling film..." before empty state renders

**Severity**: S2 (Minor)
**Category**: ui-bug
**Source**: Deep Audit 2026-03-28, finding S1-004

## Problem

When visiting compare.html without URL params, the HTML-embedded "pulling film..."
loading text flashes briefly before JavaScript replaces it with the proper empty state
("Pick two players first, boss."). The empty state exists and works correctly, but
the flash of loading content is jarring.

## Root Cause

- `frontend/compare.html:346-348` — Default HTML contains visible loading div:
  ```html
  <div class="compare-loading">
    <div class="compare-loading-text">pulling film...</div>
  </div>
  ```
- `frontend/compare.js:22-35` — Async `init()` checks URL params and replaces with
  empty state if `!ids || ids.length < 2` (lines 24-32), but this runs AFTER the
  HTML renders
- `frontend/compare.js:25-31` — Empty state message is correct:
  "Pick two players first, boss." + "Select two players in the Lab..."

## Fix

Hide the loading div by default with `style="display:none"` and only show it when
an actual API request begins (inside `loadComparison()`).

## Scope

- 2 files: `frontend/compare.html`, `frontend/compare.js`
- ~3 line changes
