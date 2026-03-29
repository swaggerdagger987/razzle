---
id: S1-036
severity: S1
confidence: HIGH
category: mobile
source: DQ-144+DQ-389
status: OPEN
---

# 143 CSS :hover rules fire on touch devices — no @media(hover:hover) guard

## Root Cause

Sitewide, 143 CSS `:hover` rules apply unconditionally. On touch devices (phones, tablets), tapping an element triggers `:hover` which then "sticks" until the user taps elsewhere. This causes:

- Cards appearing permanently "lifted" after tap
- Background highlights persisting on table rows
- Button states stuck in hover color
- Tooltips and hover cards triggering on tap and not dismissing

Additionally, `frontend/lab-panels.js` and 14+ standalone HTML files use inline `onmouseenter`/`onmouseleave` handlers (DQ-389) that bypass any CSS-level `@media(hover:hover)` guard and fire on touch devices.

## Files

CSS `:hover` rules without media guard:
- `frontend/styles.css` — 25+ hover rules
- `frontend/lab-panels.css` — 40+ hover rules
- `frontend/lab.html` — 15+ hover rules in `<style>` blocks
- 50+ standalone HTML files — 2-5 hover rules each

JS inline hover handlers:
- `frontend/lab-panels.js` — `onmouseenter`/`onmouseleave` in dynamically generated HTML
- 14+ standalone HTML files — inline hover handlers in JS-generated table rows

## Fix

1. Wrap cosmetic `:hover` rules in `@media (hover: hover)` blocks. Functional hovers (e.g., dropdown menus) can remain unwrapped.
2. Replace inline `onmouseenter`/`onmouseleave` in JS with CSS hover rules inside `@media (hover: hover)`.
3. For hover cards (`lab.js:2120-2133`), add a `matchMedia('(hover: hover)').matches` check before attaching hover listeners.

## Acceptance Criteria

1. On a touch device (or Chrome DevTools mobile emulation), tapping a card/row does NOT trigger a persistent hover state
2. Hover lift animations only apply when a pointing device is present
3. Hover cards don't fire on touch — only on mouse hover
4. Desktop hover behavior unchanged
