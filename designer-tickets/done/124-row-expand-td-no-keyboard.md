# DES-124: Row rank/expand cell not keyboard accessible

**Priority:** P2 — Accessibility
**Component:** lab.js
**Affects:** Screener rows (every player row)

## Problem

The rank cell in each screener row (leftmost number) is clickable to expand weekly breakdown data. It's a `<td onclick>` with `cursor:pointer` and a title attribute, but NO `role`, NO `tabindex`, and NO `onkeydown` handler.

## Evidence

- `lab.js:1770`:
  ```javascript
  html += `<td class="col-rank" style="cursor:pointer;" onclick="event.stopPropagation(); toggleRowExpand('${escapeJS(player.player_id)}', this)" title="Click to expand weekly stats">`;
  ```
- Missing: `role="button"`, `tabindex="0"`, `onkeydown`, `aria-expanded`, `aria-label`

## Fix

Add `role="button" tabindex="0" aria-expanded="false" aria-label="Expand weekly stats for [player name]"` and an `onkeydown` handler for Enter/Space. Update `aria-expanded` to `"true"` when the row is expanded.
