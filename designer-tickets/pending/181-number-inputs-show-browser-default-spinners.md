# DES-181: 6 number inputs show browser-default spinners — breaks design aesthetic

**Priority**: P2 — Design consistency
**Scope**: styles.css (global fix), affects 6+ inputs across 4 files
**Category**: Design system

## Problem

Only `.filter-input-sm` in lab.html (lines 823-824) hides WebKit number spinners. Six other `type="number"` inputs across the codebase show default browser up/down arrows:

| File | Input | Context |
|------|-------|---------|
| lab.html:3438 | `#minGPInput` | Min games played filter |
| lab.html:3532 | `#filterValue` | Filter threshold value |
| auction.html:333 | `#roster-input` | Roster size slider |
| formulas.js:31 | `.formula-weight` | Formula weight percentage |
| lab-panels.js:1179 | `#lp-av-roster` | Panel auction roster input |
| lab.js:5088 | stat edit inputs | Inline stat editing |

Chrome shows persistent up/down arrows. Firefox shows on focus. Safari shows on hover. Each browser renders them differently — creating visual inconsistency that breaks the chunky hand-crafted aesthetic.

## Fix

Add global spinner-hide rules to styles.css:

```css
/* Hide browser-default number spinners — use chunky design instead */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}
```

This matches the existing pattern in lab.html for `.filter-input-sm`.

## Why this matters

Browser-default spinners look like unstyled form controls — they break the illusion that every element was hand-crafted. A Reddit user screenshotting the Lab with a Chrome spinner visible undermines the "polished" impression.
