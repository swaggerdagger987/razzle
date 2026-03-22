# DES-041: styles.css has 3px and 6px border-radius — below design minimum

**Priority**: P2
**Area**: styles.css (shared stylesheet)
**Impact**: 7 components in the shared stylesheet use `border-radius: 3px` or `6px`. The DESIGN.md minimum token is `--radius-sm` (8px). These sub-minimum values make small UI elements feel sharper/more corporate than the rest of the chunky, sticker-like aesthetic.

## The Problem

**border-radius: 6px (5 instances):**
- Line 303: `.mobile-nav-close` — mobile hamburger close button
- Line 406: `.nav-search-hint` — Ctrl+K search button
- Line 1352: `.tag-picker-option` — tag dropdown options
- Line 1443: `.note-editor-input` — player notes textarea
- Line 1517: `.share-dropdown` (approximate)

**border-radius: 3px (2 instances):**
- Line 423: `.nav-search-hint kbd` — keyboard shortcut badge
- Line 1169: `.cmd-palette-hint kbd` — command palette key badge

DESIGN.md token table: `--radius-sm` (8px) is for "inputs, small badges, pricing badges, info boxes."

## The Fix

```css
/* 6px → var(--radius-sm) */
.mobile-nav-close { border-radius: var(--radius-sm); }
.nav-search-hint { border-radius: var(--radius-sm); }
.tag-picker-option { border-radius: var(--radius-sm); }
.note-editor-input { border-radius: var(--radius-sm); }

/* 3px → var(--radius-sm) for kbd badges */
.nav-search-hint kbd { border-radius: var(--radius-sm); }
.cmd-palette-hint kbd { border-radius: var(--radius-sm); }
```

Note: `kbd` badges might warrant a smaller radius. If so, consider adding a `--radius-xs: 4px` token rather than using a magic number.

## Why This Matters

The shared stylesheet is loaded on every page. These are small but high-frequency UI elements — the keyboard shortcut badge appears in the nav on every page, the mobile close button is tapped on every mobile visit. Consistent radius governance compounds into the "this feels cohesive" impression.
