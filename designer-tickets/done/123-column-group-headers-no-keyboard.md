# DES-123: Column group headers not keyboard accessible

**Priority:** P2 — Accessibility
**Component:** lab.js
**Affects:** Screener table group header row (G key toggle)

## Problem

Column group headers (Fantasy, Passing, Rushing, Receiving, etc.) are `<th onclick>` elements that toggle column group collapse. They have `cursor:pointer` and `onclick` but NO `tabindex` and NO `onkeydown` handler. Keyboard users cannot toggle column groups.

## Evidence

- `lab.js:1523`:
  ```javascript
  html += `<th colspan="${g.span}" class="${sepCls}" style="cursor:pointer;" onclick="toggleColumnGroup('${escapeJS(g.name)}')" title="Click to collapse ${escapeHtml(g.name)}">`;
  ```
- Missing: `tabindex="0"`, `onkeydown="if(event.key==='Enter'||event.key===' '){toggleColumnGroup(...)}"`, `aria-expanded`

## Fix

Add `tabindex="0"`, `onkeydown` for Enter/Space, and `aria-expanded="${!state._collapsedGroups?.has(g.name)}"` to indicate expand/collapse state.
