---
id: DQ-484
title: league-intel.html has 11 box-shadow instances with 2px/3px offset — should be 4px
severity: P2
category: design-token-violation
file: frontend/league-intel.html
lines: 308, 314, 329, 416, 514, 519, 528, 604, 608, 630, 636
---

## Problem

DESIGN.md specifies `box-shadow: 4px 4px 0` for the chunky comic-strip aesthetic. league-intel.html has 11 instances using `2px 2px 0` or `3px 3px 0` offsets, making Bureau of Intelligence cards look thinner/less chunky than the rest of the site.

## Expected

Replace all `box-shadow: 2px 2px 0` and `box-shadow: 3px 3px 0` with `box-shadow: 4px 4px 0` in league-intel.html.

## Acceptance Criteria

- `grep -n "box-shadow: [23]px [23]px" frontend/league-intel.html` returns zero results
- All card shadows in Bureau match the 4px spec
