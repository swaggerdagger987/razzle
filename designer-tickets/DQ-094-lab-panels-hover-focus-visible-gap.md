---
id: DQ-094
title: lab-panels.css — 121 :hover rules vs 5 :focus-visible — keyboard users see nothing
priority: P2
category: accessibility
status: open
cycle: 13
---

## Problem

lab-panels.css has 121 elements with `:hover` styling but only 5 with `:focus-visible` rules. Keyboard users navigating the 70+ Lab panels get zero visual feedback on 116 interactive elements — buttons, cards, tabs, badges, links inside panels.

Done ticket 089 added initial focus-visible coverage but achieved <5% of the needed rules. styles.css has better parity (22 hover / 20 focus-visible), but lab-panels.css is the critical gap.

## Evidence

Code:
- `grep -c ":hover" frontend/lab-panels.css` → 121
- `grep -c ":focus-visible" frontend/lab-panels.css` → 5
- `grep -c ":hover" frontend/styles.css` → 22
- `grep -c ":focus-visible" frontend/styles.css` → 20

The 116-rule gap means keyboard-only users (and screen reader users) navigate the entire Lab panel ecosystem blind.

## Fix

For each `:hover` rule in lab-panels.css, add a matching `:focus-visible` with the same visual treatment. The pattern:

```css
/* Before */
.lp-tab:hover { background: var(--bg-warm); }

/* After */
.lp-tab:hover,
.lp-tab:focus-visible { background: var(--bg-warm); outline: 2px solid var(--orange); outline-offset: 2px; }
```

This is a mechanical find-and-add pass — same styles, plus a visible outline for keyboard users.

## Files
- `frontend/lab-panels.css` (116 rules need :focus-visible added)
