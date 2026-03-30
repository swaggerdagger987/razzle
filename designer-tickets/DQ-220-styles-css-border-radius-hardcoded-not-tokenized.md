# DQ-220: styles.css — 15 selectors use hardcoded border-radius instead of tokens

**Priority**: P3
**Category**: Design token consistency
**Page**: Sitewide

## What's wrong

15 selectors in styles.css use `border-radius: 8px` instead of `var(--radius-sm)`, and 1 uses `border-radius: 20px` instead of `var(--radius-lg)`. The values happen to be correct today, but they're not referencing the design tokens. If `--radius-sm` changes from 8px to 6px, these won't update.

## Where (border-radius: 8px → var(--radius-sm))

1. `styles.css:215` — `.nav-links a`
2. `styles.css:244` — `.hamburger-toggle`
3. `styles.css:343` — `.mobile-nav-link`
4. `styles.css:544` — `.nav-user-trigger`
5. `styles.css:687` — `.auth-tabs`
6. `styles.css:720` — `.auth-form input`
7. `styles.css:757` — `.btn-chunky`
8. `styles.css:785` — `.btn-primary`
9. `styles.css:925` — `.input-chunky`
10. `styles.css:952` — `.select-chunky`
11. `styles.css:1043` — `.theme-toggle`
12. `styles.css:1108` — `.cmd-palette-input`
13. `styles.css:1288` — `.logo-mark` (media query)
14. `styles.css:1382` — `.player-tag-chip`
15. `styles.css:1577` — `.diff-mode-banner`

## Where (border-radius: 20px → var(--radius-lg))

16. `styles.css:828` — `.chip`

## Fix

Find-and-replace: `border-radius: 8px` → `border-radius: var(--radius-sm)` for these 15 selectors, and `border-radius: 20px` → `border-radius: var(--radius-lg)` for `.chip`. Mechanical change, zero risk.

## Not a dupe of

- Done ticket 041 (styles-css-small-radius-orphans) — that fixed SUB-minimum values (4px, 6px). These are correct-value-but-not-tokenized.
- Done ticket 016 (border-radius ungoverned) — that covered OFF-token values. These ARE the right values, just hardcoded instead of referenced.
- DQ-006 (off-token border radius) — that's about WRONG values. These are RIGHT values, wrong reference method.
