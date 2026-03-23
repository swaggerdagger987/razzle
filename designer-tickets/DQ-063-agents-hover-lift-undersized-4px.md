# DQ-063: agents.html hover lift undersized — 7+ hovers go to 4px instead of 6px

**Priority**: P2 — Interactive feel is flat, doesn't match design spec
**Category**: Interactive States / Hover Lift
**Severity**: MEDIUM — cards don't fully "lift" on hover

## Problem

DESIGN.md specifies hover lift pattern:
- At rest: `box-shadow: 4px 4px 0 var(--ink)`
- On hover: `box-shadow: 6px 6px 0 var(--ink)` + `transform: translate(-2px, -2px)`

agents.html hover rules grow shadow to only 4px (same as rest) with translate(-1px, -1px), so the card slides but doesn't visually lift. Compare to pricing.html which correctly uses 6px on hover.

### Affected hover rules:

| Element | Line | Current hover shadow | Should be |
|---------|------|---------------------|-----------|
| `.agent-badge:hover` | ~85 | `4px 4px 0` | `6px 6px 0` |
| `.scenario-chip:hover` | ~528 | `4px 4px 0` | `6px 6px 0` |
| `.scenario-run-all:hover` | ~559 | `4px 4px 0` | `6px 6px 0` |
| `.scenario-agent-btn:hover` | ~595 | `4px 4px 0` | `6px 6px 0` |
| `.warroom-bio-card:hover` | ~110 | `4px 4px 0` | `6px 6px 0` |

All also use `translate(-1px, -1px)` — should be `translate(-2px, -2px)`.

## Fix

For each hover rule, update both shadow and translate:
```css
/* Before */
box-shadow: 4px 4px 0 var(--ink);
transform: translate(-1px, -1px);

/* After */
box-shadow: 6px 6px 0 var(--ink);
transform: translate(-2px, -2px);
```

## Verification

Hover over agent badges and scenario chips. They should visually "pop up" off the surface, matching the pricing cards hover behavior.
