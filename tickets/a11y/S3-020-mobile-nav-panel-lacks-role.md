# S3-020: Mobile nav panel lacks role="navigation" and aria-label

**Severity**: S3 (Low)
**Category**: a11y
**Source**: 2026-03-14-a11y-audit.md #21
**WCAG**: 4.1.2 (Name, Role, Value)
**Found**: 2026-03-14 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

`frontend/app.js:151` creates the mobile navigation panel as a plain `<div>` with `className = "mobile-nav-panel"` — no `role` or `aria-label`.

The hamburger toggle button correctly has `aria-label="Open navigation menu"` and `aria-expanded` state. But the panel itself is an unlabeled div.

## Fix

After line 151 in app.js, add role and label:
```javascript
panel.className = "mobile-nav-panel";
panel.setAttribute("role", "navigation");
panel.setAttribute("aria-label", "Mobile navigation");
```

## Files to Change

- `frontend/app.js:151-152` — add role and aria-label to mobile nav panel

## Accept When

1. Mobile nav panel has `role="navigation"` and `aria-label="Mobile navigation"`
2. Screen readers announce it as a navigation landmark
