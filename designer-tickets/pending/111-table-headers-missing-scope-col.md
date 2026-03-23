# DES-111: Zero `scope="col"` on table headers in standalone pages and lab-panels.js

**Priority**: P2 — affects all data panels
**Category**: Screen reader accessibility
**WCAG**: 1.3.1 (Info and Relationships)

## Problem

lab.js correctly uses `scope="col"` on all 8 screener table header types:
```html
<th scope="col" class="col-rank" title="Overall rank by current sort">#</th>
```

But ZERO instances of `scope="col"` exist in:
- lab-panels.js (37 tables, 0 scope attributes)
- Any standalone HTML page (45+ tables, 0 scope attributes)

Without `scope`, screen readers cannot associate data cells with their column headers. When a screen reader user navigates to a cell showing "12.4", they don't know whether that's PPG, Edge, or GP — the header association is missing.

## Location

**lab-panels.js** — all `'<th>...'` strings (37 tables):
```js
html += '<th>#</th><th>Player</th><th>Pos</th><th>PPG</th>...';
```

**Standalone HTML pages** — all `<th>` in JS-generated table headers:
```js
html += '<th>#</th><th>Player</th><th>Pos</th><th>PPG</th><th>Pos Avg</th><th>Edge</th>';
```

## Fix

Add `scope="col"` to every `<th>` in data table headers. Mechanical find-and-replace:
- `<th>` → `<th scope="col">` (in table header rows only)
- `'<th>'` → `'<th scope="col">'` (in JS string concatenation)

Exception: empty `<th></th>` spacer columns should get `scope="col" aria-label="Actions"` or similar (see DES-113).

## Why This Matters

The pattern exists and works correctly in lab.js. Extending it to all tables is a consistency fix that makes every data panel accessible to screen readers. This is table stakes for WCAG AA compliance.
