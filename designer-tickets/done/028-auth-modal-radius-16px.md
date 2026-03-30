# DES-028: Auth modal border-radius 16px — orphaned value not in design system

**Priority**: P1
**Area**: sitewide (styles.css)
**Impact**: The auth modal uses `border-radius: 16px` which doesn't match any design token. The design system defines `--radius-sm` (8px), `--radius` (12px), and `--radius-lg` (20px). 16px is an orphaned value that exists nowhere else.

## The Problem

`frontend/styles.css` line 608:
```css
.auth-modal {
  border-radius: 16px;  /* ← not a design token */
}
```

Design tokens:
- `--radius-sm`: 8px (inputs, small badges)
- `--radius`: 12px (cards, containers, modals — the default)
- `--radius-lg`: 20px (pills, chips, agent badges — sticker-shaped)

16px falls between `--radius` and `--radius-lg` with no semantic meaning.

## The Fix

```css
.auth-modal {
  border-radius: var(--radius);  /* 12px — consistent with other cards */
}
```

Or if a larger radius is desired for the modal's prominence:
```css
.auth-modal {
  border-radius: var(--radius-lg);  /* 20px — sticker-shaped */
}
```

## Why This Matters

The auth modal is seen by every user who registers or logs in. Orphaned values erode the design system — if the modal can be 16px, why can't anything else? Pick a token and commit.
