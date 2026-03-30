---
id: DQ-384
title: Home page mini-screener position tabs (.mini-tab) lack focus-visible state
priority: P2
category: accessibility
page: index.html
status: open
cycle: 50
---

## Problem

The mini-screener on the home page has position filter tabs (ALL, QB, RB, WR, TE) styled as `.mini-tab`. These have `:hover` and `:active` CSS states but NO `:focus-visible` rule. Keyboard users tabbing through the mini-screener get zero visual feedback when focus lands on a position tab.

## Evidence

- `index.html:376-389` — `.mini-tab` has `:hover` (line ~385) but no `:focus-visible`
- The home page mini-screener is the first interactive element a new user encounters after scrolling past the hero

## Fix

Add focus-visible to the existing `.mini-tab` styles:

```css
.mini-tab:focus-visible {
  outline: 2px solid var(--orange);
  outline-offset: 2px;
}
```

## Verification

1. Load index.html
2. Tab into the mini-screener section
3. Position tabs should show a visible orange outline when focused via keyboard
