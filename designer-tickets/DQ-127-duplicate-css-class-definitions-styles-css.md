# DQ-127: 10 duplicate CSS class definitions in styles.css — cascade fragility

**Priority**: P3 — LOW-MEDIUM
**Category**: CSS Architecture
**Scope**: frontend/styles.css

## Problem

10 CSS class names are defined multiple times in styles.css with different property sets. The last definition wins (CSS cascade), but this creates fragile code where reordering rules silently breaks styling.

## Duplicate classes found

1. `.auth-form` — defined 2+ times
2. `.cmd-palette-hint` — 2 definitions
3. `.cmd-palette-item.active` — 2 definitions
4. `.logo-text` — 2 definitions
5. `.nav-links` — 2 definitions
6. `.nav-search-hint` — 2 definitions
7. `.nav-user-dropdown.open` — 2 definitions
8. `.notes-cell` — 2 definitions
9. `.player-name-cell` — 2 definitions

## Impact

- Maintainability: editing one definition has no effect because another definition overrides it
- Debug difficulty: "why won't this CSS change take effect?" → there's a duplicate later in the file
- Potential specificity bugs if definitions have conflicting properties

## Fix

For each duplicate, merge the two definitions into one authoritative definition. If the duplicate exists because of a media query variant, that's fine — but document it with a comment. If it's truly redundant, remove the earlier one.

Mechanical: search styles.css for duplicate selectors, merge or remove.
