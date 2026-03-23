# DES-122: Notes cell (td onclick) not keyboard accessible

**Priority:** P1 — Accessibility
**Component:** lab.js
**Affects:** Screener rows (every player row)

## Problem

The Notes cell in each screener row is a `<td onclick>` that opens the note editor. It has no `role`, no `tabindex`, no `onkeydown`, and no `aria-label`. Keyboard users cannot focus or activate it to add/edit notes.

Player notes are a key personalization feature. Clicking the cell opens a 140-character Caveat-font annotation field. This is mouse-only.

## Evidence

- `lab.js:1831` (has note):
  ```javascript
  html += `<td class="notes-cell has-note" onclick="event.stopPropagation(); showNoteEditor('${escapeJS(pid)}', this)" title="...">`;
  ```
- `lab.js:1833` (no note):
  ```javascript
  html += `<td class="notes-cell" onclick="event.stopPropagation(); showNoteEditor('${escapeJS(pid)}', this)" title="Click to add note">`;
  ```
- Missing on both: `role="button"`, `tabindex="0"`, `onkeydown` handler, `aria-label`

## Fix

Add `role="button" tabindex="0" aria-label="Edit note for [player name]"` and an `onkeydown` handler for Enter/Space to both variants.
