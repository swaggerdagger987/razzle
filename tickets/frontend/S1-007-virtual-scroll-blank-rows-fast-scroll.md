# S1-007: Virtual scroll renders blank rows on fast scroll

**Severity**: S1 (High)
**Category**: ui-bug
**Source**: EDGE-CASES.md #24
**Found**: 2026-03-14 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

`frontend/lab.js:1804-2006` — `_vscrollRows` is a lazily-built sparse array. HTML strings are only generated for rows within the visible viewport window. When scrolling fast, the render loop reads indices that haven't been built yet.

```javascript
// lab.js:1804
let _vscrollRows = [];  // Sparse array

// lab.js:2006 — rendering loop
html += _vscrollRows[i] || '';  // Undefined entries render as empty string
```

The `|| ''` fallback prevents literal "undefined" text but still shows blank table rows — gaps in the data that flash during rapid scrolling. The lazy builder at lines 1991-1992 only populates entries for the current visible window.

## Fix

Pre-build all rows when data changes (not lazily), or implement a proper virtual scroll with a buffer zone that builds rows N items ahead/behind the viewport:

```javascript
// Build buffer zone: visible range + 20 rows above/below
const bufferStart = Math.max(0, startIdx - 20);
const bufferEnd = Math.min(total, endIdx + 20);
for (let i = bufferStart; i < bufferEnd; i++) {
  if (!_vscrollRows[i]) {
    _vscrollRows[i] = buildRow(items[i], i);
  }
}
```

## Files to Change

- `frontend/lab.js:1991-2006` — add buffer zone to lazy builder

## Accept When

1. Scroll quickly through a 500+ row dataset — no blank rows visible
2. Performance remains acceptable (no jank from pre-building too many rows)
3. Memory doesn't grow unboundedly (clear old entries outside buffer)

## Do NOT Touch

- Virtual scroll container setup (lines 1804-1840) — keep the overall approach
- Row building function — just call it earlier (in buffer zone)
