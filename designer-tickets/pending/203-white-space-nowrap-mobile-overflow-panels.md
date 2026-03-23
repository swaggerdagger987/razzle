# DES-203: white-space:nowrap on panel data causes horizontal overflow on mobile

**Priority**: P2
**Category**: Mobile UX
**Affects**: styles.css (7 instances), lab-panels.css (60+ instances), 30+ standalone panel pages
**Cycle**: 19

## Problem

`white-space: nowrap` is applied broadly to table headers, badge text, and data labels across panel pages. On viewports below 480px, these nowrap elements push their parent containers wider than the screen, causing unexpected horizontal scrolling. This is especially bad on panel pages loaded inside the Lab sidebar iframe where the viewport is already constrained.

## Evidence

`styles.css` — 7 nowrap instances on core elements:
- Line 13: `.sr-only` (acceptable — screen reader utility)
- Line 217: nav links (acceptable — nav items are short)
- Line 447: `.filter-tag` (problematic on mobile with long filter values)
- Line 589: dropdown items
- Line 1186: footer links
- Line 1470, 1497: misc UI

`lab-panels.css` — 60+ nowrap instances across panel-specific selectors. Many are on table headers (`<th>`) that contain multi-word labels like "Fantasy Points Per Game" or "Target Share %" that won't fit on a 375px phone.

Specific example — `lab-panels.css:4826`:
```css
.gs-name { font-weight: bold; color: var(--ink); white-space: nowrap; }
```
Player names like "Amon-Ra St. Brown" at `font-weight: bold` will extend past container width on narrow screens.

## Fix

Audit each nowrap instance and apply one of:
1. **Remove nowrap** where text can safely wrap (table headers, player names)
2. **Add text-overflow: ellipsis + overflow: hidden + max-width** where truncation is acceptable
3. **Keep nowrap** only where wrapping would break layout (badges, position chips, short labels)

For table headers specifically, add `@media (max-width: 480px)` override that removes nowrap and reduces font-size.

## Why it matters

Twitter and Reddit traffic is heavily mobile. A dynasty manager tapping a panel link from a tweet and seeing horizontal scroll on their phone = bounce. The Lab sidebar already constrains width — nowrap inside an iframe inside a sidebar is a recipe for overflow.
