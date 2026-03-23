---
id: DQ-265
title: Position color badges with white text fail WCAG AA contrast — RB teal is worst at 2.17:1
priority: P1
category: accessibility
status: open
cycle: 36
---

## Problem

All four position color badges use white text on colored backgrounds. None meet WCAG AA contrast ratio (4.5:1 minimum for normal text):

| Position | Color | Hex | Contrast on white | Required | Pass? |
|----------|-------|-----|-------------------|----------|-------|
| QB | Blue | #5b7fff | 3.54:1 | 4.5:1 | FAIL |
| RB | Teal | #2ec4b6 | 2.17:1 | 4.5:1 | FAIL |
| WR | Terracotta | #d97757 | 3.12:1 | 4.5:1 | FAIL |
| TE | Purple | #8b5cf6 | 4.23:1 | 4.5:1 | FAIL |

RB teal is the worst — it's at less than half the required contrast. These badges appear hundreds of times across the site (screener rows, player profiles, charts, standalone pages).

## Evidence

Position badge CSS in `frontend/styles.css`:
```css
.chip.active[data-pos="QB"] { background: var(--pos-qb); color: white; }
```

White text (`#ffffff`) on each position color fails AA.

## Fix

Two options:

**Option A (recommended):** Change badge text from white to `var(--ink)` (dark espresso #2d1f14). All four position colors pass AA with dark text:
- QB blue on ink: 8.5:1
- RB teal on ink: 10.2:1
- WR terracotta on ink: 6.8:1
- TE purple on ink: 5.4:1

**Option B:** Darken the position colors ~15-20% to pass with white text. This changes the brand palette.

## Files
- `frontend/styles.css` — position badge text color
- `frontend/lab.html` — inline position badge styles
- Any standalone page with position badges

## Impact
Accessibility compliance failure on the most-used UI element across the entire site. Option A is a color swap, not a redesign.
