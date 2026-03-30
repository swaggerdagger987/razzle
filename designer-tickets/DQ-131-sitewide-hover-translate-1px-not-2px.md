---
id: DQ-131
priority: P1
area: design-system
section: hover-lift
type: token-violation
status: open
---

# Sitewide hover translate(-1px) should be translate(-2px) per DESIGN.md

## What's wrong

DESIGN.md specifies hover lift as `6px 6px 0` + `translate(-2px, -2px)`. Across the entire frontend, 35 instances in 16 files use `translate(-1px, -1px)` instead. The lift feels half as physical as it should.

## Where (35 instances, 16 files)

- `styles.css` — lines 224, 767, 795, 836, 1054
- `index.html` — line 371
- `lab.html` — lines 474, 2362, 2931, 3036
- `agents.html` — lines 86, 529, 560, 596, 1227, 1274, 1382, 1472
- `league-intel.html` — lines 315, 520, 609, 637, 1752
- `lab-panels.css` — lines 2308, 4155
- `prompts.html` — line 50
- `aging.html` — line 79
- `cheatsheet.html` — line 77
- `matchups.html` — lines 92, 279
- `scoring.html` — line 77
- `targets.html` — line 90
- `tools.html` — lines 110, 237
- `weekly.html` — line 79

## Fix

Global find-replace: `translate(-1px, -1px)` -> `translate(-2px, -2px)` in all frontend files.

**Exception**: `translate(-1px,-1px)` (no spaces) should also be caught.

## Why this matters

The hover lift is core to the Razzle "physical, comic-strip" feel. At -1px the lift is barely perceptible. At -2px it matches the design spec and makes every card feel like a sticker you can peel off.
