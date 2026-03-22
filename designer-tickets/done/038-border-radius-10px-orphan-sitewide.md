# DES-038: border-radius: 10px is not a design token — used sitewide

**Priority**: P2
**Area**: sitewide (styles.css + 20+ HTML pages)
**Impact**: 10px is used as a border-radius on dozens of components but is NOT a design token. DESIGN.md defines three tokens: `--radius-sm` (8px), `--radius` (12px), `--radius-lg` (20px). 10px falls between sm and default, creating visual inconsistency.

## The Problem

Grep found `border-radius: 10px` in:

**styles.css (5 instances):**
- Line 179: `.logo-mark` (the site logo tiger icon — visible on EVERY page)
- Line 530: `.nav-dropdown-menu`
- Line 1325: `.tag-picker`
- Line 1418: `.note-editor-popup`
- Plus toast and share-dropdown components

**HTML pages (20+ files):**
- agents.html (6+ instances in CSS and inline JS)
- league-intel.html (5+ instances including JS-generated cards)
- advantage.html, breakdown.html, archetypes.html, and many panel pages

**JS-generated HTML:**
- league-intel.html JS template strings: lines 2442, 6337, 6517, 7342
- agents.html JS template strings: lines 2124, 2139

Total: 50+ instances across the codebase.

## The Fix

Decision required: 10px should become either `--radius-sm` (8px) or `--radius` (12px).

Recommendation: Use `--radius-sm` (8px) for small elements (logo-mark, dropdowns, pickers, toasts) and `--radius` (12px) for cards and containers. The visual difference between 10px and 8px/12px is subtle but the token governance is critical for consistency.

For JS-generated HTML, replace `border-radius:10px` with `border-radius:var(--radius-sm)` or `border-radius:var(--radius)`.

## Why This Matters

The logo mark uses 10px and appears on every page. When the site's most prominent element uses a non-token value, it undermines the design system. Dynasty power users notice visual inconsistency — it signals "unfinished product."
