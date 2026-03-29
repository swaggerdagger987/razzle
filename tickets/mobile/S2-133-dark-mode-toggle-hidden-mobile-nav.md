---
id: S2-133
severity: S2
category: mobile
source: DEEP-AUDIT-TICKETS.md (S1-011)
status: open
---

# S2-133: Dark mode toggle may be inaccessible or visually broken on mobile

## Problem

The dark mode toggle has two separate implementations for desktop and mobile, creating a potential sync/visibility issue:

1. **Desktop toggle** — `frontend/app.js:86` appends `.theme-toggle` button directly to `.topnav`
2. **Mobile toggle** — `frontend/app.js:194-208` creates a SEPARATE `.mobile-nav-theme` button inside the hamburger panel footer

The desktop `.theme-toggle` is never explicitly hidden at mobile breakpoints in CSS. At `@media (max-width: 768px)`, `.nav-links` gets `display: none !important` but `.theme-toggle` has no hide rule (`frontend/styles.css:420-430`). This means:

- The desktop toggle may remain visible in the top nav bar on mobile, cluttering the header alongside the hamburger icon
- OR the `.topnav` layout at mobile widths may accidentally obscure it

The mobile hamburger panel has its own toggle (`frontend/app.js:194-208`), but the two buttons must be synced — toggling one must update the other.

## Root Cause

- **`frontend/styles.css:420-430`** — `@media (max-width: 768px)` block hides `.nav-links` and `.nav-search-hint` but has NO rule for `.theme-toggle`
- **`frontend/app.js:86`** — Desktop toggle appended to `.topnav` (not inside `.nav-links`, so not hidden by the nav-links rule)
- **`frontend/app.js:194-208`** — Separate mobile toggle created in hamburger panel
- **`frontend/app.js:205`** — Sync query: `.topnav > .theme-toggle` used to update desktop button text when mobile button clicked

## Fix

Add `.theme-toggle { display: none; }` inside the `@media (max-width: 768px)` block in `frontend/styles.css` to hide the desktop toggle on mobile. The mobile hamburger panel's `.mobile-nav-theme` button is the correct mobile-accessible toggle.

Verify the sync logic at `app.js:205` correctly updates both toggles when either is clicked.

## Acceptance Criteria

- [ ] Desktop `.theme-toggle` hidden at viewport <= 768px
- [ ] Mobile hamburger panel includes working dark mode toggle
- [ ] Toggling dark mode in hamburger syncs with desktop toggle (and vice versa on resize)
- [ ] DESIGN.md requirement "Site-wide dark mode toggle available" is met on all viewports
