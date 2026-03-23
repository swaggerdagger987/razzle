# DES-121: Tag picker icon not keyboard accessible

**Priority:** P1 — Accessibility
**Component:** lab.js
**Affects:** Screener rows (every player row)

## Problem

The tag picker icon (colored dot in each row) is a `<span onclick>` with no `role`, no `tabindex`, no `onkeydown`, and no `aria-label`. Keyboard users cannot focus it or activate it. Screen readers don't announce it as interactive.

Player tags (BUY/SELL/WATCH/TARGET/AVOID) are a core screener feature. Power users use them to organize their draft boards and trade targets. Making this mouse-only excludes keyboard users from a key workflow.

## Evidence

- `lab.js:1802`:
  ```javascript
  html += `<span class="tag-icon" onclick="event.stopPropagation(); showTagPicker('${pidJS}', this)" title="Tag player">&#9679;</span>`;
  ```
- Missing: `role="button"`, `tabindex="0"`, `onkeydown="if(event.key==='Enter'||event.key===' '){...}"`, `aria-label="Tag player"`

## Fix

```javascript
html += `<span class="tag-icon" role="button" tabindex="0" aria-label="Tag player" onclick="event.stopPropagation(); showTagPicker('${pidJS}', this)" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();showTagPicker('${pidJS}',this)}">&#9679;</span>`;
```
