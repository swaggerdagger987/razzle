---
id: DQ-347
title: Home page smart-chips have no :focus-visible state
priority: P2
category: accessibility
page: index.html
cycle: 45
---

## Problem

The home page "discovery" smart-chips (Breakout Candidates, Buy Low Targets, Workhorses, Sleepers, Rookies) at lines 720-724 are `<a>` links with hover styles but no `:focus-visible` rule:

```css
/* Line 355-373 */
.smart-chip {
    /* ... styles defined */
}
.smart-chip:hover {
    background: var(--orange);
    color: var(--text-on-accent);
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0 var(--ink);
}
/* No .smart-chip:focus-visible rule exists */
```

Keyboard users tabbing through the home page get no visual feedback when these chips are focused. The hero buttons (btn-hero) and nav links already have focus-visible (DES-130, DES-082), but smart-chips were missed.

## Not a duplicate of

- DES-130: covers btn-hero focus-visible (done)
- DQ-082: covers nav links focus-visible (done)
- DQ-094: covers lab-panels focus-visible (different page)
- DQ-064: covers outline-none on inputs (different element type)

## Fix

Add after `.smart-chip:hover`:
```css
.smart-chip:focus-visible {
    outline: 2px solid var(--orange);
    outline-offset: 2px;
}
```

## Files
- `frontend/index.html` (after line 373)
