# S2-031: Command palette hidden on mobile — no search icon

**Severity**: S2 (Minor)
**Category**: mobile
**Source**: Deep Audit 2026-03-28, finding S2-011

## Problem

The Ctrl+K command palette is the primary quick-search feature, but on mobile
the search hint is hidden and there's no search icon button. Mobile users
cannot discover or trigger the command palette. They must navigate to the Lab
to search for players.

## Root Cause

- `frontend/styles.css:419-420` — At `@media (max-width: 768px)`:
  `.nav-search-hint { display: none; }` hides the search trigger completely
- `frontend/styles.css:1337-1338` — Also hidden at smaller breakpoint
- `frontend/app.js:1563` — `openCmdPalette()` function exists and works, but
  there is no mobile-visible button that calls it

## Fix

Add a search icon button visible on mobile:
1. In the mobile hamburger panel or sticky header, add a magnifying glass icon button
2. On tap, call `openCmdPalette()`
3. Alternatively, add a persistent search icon in the mobile top bar (outside hamburger)

## Scope

- 2 files: `frontend/app.js` (add button), `frontend/styles.css` (show on mobile)
- ~10 lines
