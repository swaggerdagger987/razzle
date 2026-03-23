# DES-120: Sparkline and Notes column headers not keyboard accessible

**Priority:** P1 — Accessibility
**Component:** lab.js
**Affects:** Screener table (the growth engine)

## Problem

The Sparkline and Notes column headers in the screener table have NO `tabindex="0"` and NO `onkeydown` handler. They are completely unreachable by keyboard.

All other data column headers (100+) correctly have `tabindex="0"` and `onkeydown="if(event.key==='Enter'){sortBy(...)}"` (line 1598). The Sparkline and Notes headers are rendered by separate code paths that skip these attributes.

## Evidence

- `lab.js:1593-1594` — Sparkline header: no tabindex, no onkeydown
  ```javascript
  html += `<th scope="col"${tip} data-col="${key}"${dragAttr} style="${cwStyle || 'width:80px;'} text-align:center;">${col.label}<div class="col-resize-handle" data-col="${key}"></div></th>`;
  ```
- `lab.js:1595-1596` — Notes header: no tabindex, no onkeydown
  ```javascript
  html += `<th scope="col"${tip} data-col="${key}"${dragAttr} style="${cwStyle || 'width:120px; min-width:80px;'}">${col.label}<div class="col-resize-handle" data-col="${key}"></div></th>`;
  ```
- Compare with `lab.js:1598` — regular column headers have both:
  ```javascript
  html += `<th ... tabindex="0" onclick="sortBy('${key}', event)" ... onkeydown="if(event.key==='Enter'){sortBy('${key}');event.preventDefault();}">${col.label}...</th>`;
  ```

## Fix

Add `tabindex="0"` to both Sparkline and Notes `<th>` elements. Notes column could also be sortable (sort by has-note / no-note). At minimum, make them focusable so keyboard users can tab through the full header row without a gap.
