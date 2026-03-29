---
id: S2-081
severity: S2
confidence: HIGH
category: a11y
source: DQ-333,DQ-334,DQ-335,DQ-340
status: OPEN
---

# Lab sidebar categories — no keyboard/ARIA support, no focus trap on mobile

## Root Cause (CONFIRMED 2026-03-29 — code investigation)

### Category headers — no ARIA, no keyboard
- `frontend/lab.html:3217-3290` — All 12 category headers are plain `<div class="lab-sidebar-category">` with no `role`, `tabindex`, or `aria-expanded`
- `frontend/lab.html:4884-4894` — Click-only handler: `cat.addEventListener('click', function() { ... })` — no `keydown` listener for Enter/Space

### Mobile sidebar — no focus trap, no Escape
- `frontend/lab.html:277` (CSS) — `.lab-sidebar-category` defined with no interaction semantics
- Mobile sidebar overlay has no focus trap — Tab escapes behind backdrop
- No Escape key listener to dismiss sidebar

### Hamburger button — no aria-expanded
- `frontend/app.js` — Hamburger button injected without `aria-expanded` attribute

## Fix

1. `lab.html:3217-3290` — Add `role="button" tabindex="0" aria-expanded="false"` to all category `<div>` elements
2. `lab.html:4884-4894` — Add `keydown` listener for Enter/Space alongside existing click handler
3. Add focus trap to mobile sidebar overlay
4. Add Escape key listener to dismiss sidebar
5. Add `aria-expanded` to hamburger button in app.js

## Files

- `frontend/lab.html:3217-3290` — category header elements
- `frontend/lab.html:4884-4894` — click handler (needs keydown)
- `frontend/app.js` — hamburger button

## Acceptance Criteria

- Category headers keyboard-focusable and activatable
- Mobile sidebar trapped focus when open
- Escape dismisses mobile sidebar
- Hamburger button has `aria-expanded`
