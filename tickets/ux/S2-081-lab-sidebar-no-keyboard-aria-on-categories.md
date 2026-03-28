---
id: S2-081
severity: S2
confidence: HIGH
category: a11y
source: DQ-333,DQ-334,DQ-335,DQ-340
status: OPEN
---

# Lab sidebar categories — no keyboard/ARIA support, no focus trap on mobile

## Root Cause

Multiple related issues in the Lab sidebar:

1. **DQ-333**: Sidebar category headers are plain `<div>` elements with no `role="button"`, `tabindex="0"`, or keyboard handlers. Cannot expand/collapse categories via keyboard.

2. **DQ-334**: Mobile sidebar overlay has no focus trap. Tab key escapes behind the sidebar backdrop.

3. **DQ-335**: Mobile sidebar cannot be dismissed with Escape key.

4. **DQ-340**: Hamburger button has no `aria-expanded` attribute tracking sidebar state.

## Fix

1. Add `role="button" tabindex="0"` to category headers, handle Enter/Space
2. Add focus trap to mobile sidebar overlay
3. Add Escape key listener to dismiss sidebar
4. Add `aria-expanded` to hamburger button

## Files

- `frontend/lab.html` — sidebar category `<div>` elements
- `frontend/app.js` — hamburger button, mobile nav panel

## Acceptance Criteria

- Category headers keyboard-focusable and activatable
- Mobile sidebar trapped focus when open
- Escape dismisses mobile sidebar
- Hamburger button has `aria-expanded`
