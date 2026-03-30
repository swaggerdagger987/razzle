---
id: DQ-091
title: No custom scrollbar colors — default browser scrollbars clash with warm palette
priority: P2
category: design-system
status: open
cycle: 13
---

## Problem

Every scrollable area on the site (Lab data table, right-side panel, dropdowns, standalone page bodies, modal content) displays the browser's default gray/blue scrollbar. This clashes with the warm Anthropic sand + espresso palette that defines the brand.

Only 3 scrollbar rules exist in the entire codebase:
- `lab.html:42` — `scrollbar-width: thin;`
- `lab.html:2608` — `scrollbar-width: none;` (hides toolbar scrollbar)
- `lab.html:2610` — `.toolbar::-webkit-scrollbar { display: none; }` (hides toolbar scrollbar)

Zero color customization anywhere.

## Evidence

Visual: Default blue/gray scrollbar thumb visible on Lab table scroll, right panel scroll, and all standalone pages with enough content to scroll.

Code: `grep -r "scrollbar-color" frontend/` returns 0 results. `grep -r "::-webkit-scrollbar" frontend/` returns 1 result (hiding, not styling).

## Fix

Add to `styles.css` (light mode):
```css
* {
  scrollbar-width: thin;
  scrollbar-color: var(--ink-faint) var(--bg-warm);
}
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: var(--bg-warm); }
::-webkit-scrollbar-thumb { background: var(--ink-faint); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--ink-light); }
```

Dark mode handled automatically via CSS variable overrides.

## Files
- `frontend/styles.css` (add rules)
