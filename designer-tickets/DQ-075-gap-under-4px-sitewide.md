---
id: DQ-075
priority: P2
category: spacing
status: open
---

# DQ-075: gap values 1-3px across 30+ files — too tight for design system

## Problem
The design system uses chunky 3px borders and 4px shadows. Gap values of 1-3px create cramped layouts that conflict with the comic-strip aesthetic. Found **90 instances** of `gap: 1px` through `gap: 5px` across 30+ files.

Worst offenders:
- `lab-panels.css`: 26 instances
- `lab.html`: 19 instances
- `league-intel.html`: 6 instances
- `agents.html`: 7 instances

Specific patterns:
- `gap: 1px` — heatmap cells (matchups.html, weeklymvp.html)
- `gap: 2px` — stat rows (buysell, streaks, waivers, yoy)
- `gap: 3px` — sparkline wrappers, control rows
- `gap: 5px` — player meta sections (15+ panel pages use identical `gap: 5px`)

## Fix
- `gap: 1px` -> `gap: 2px` (heatmaps need tight spacing, but 1px is invisible)
- `gap: 2px` -> `gap: 4px`
- `gap: 3px` -> `gap: 4px`
- `gap: 5px` -> `gap: 6px` (nearest even value)

Standard gap scale: 4px, 6px, 8px, 12px, 16px, 24px.

## Scope
90 replacements across 30+ files. The `gap: 5px` pattern on player-meta sections is a single find-replace across 15 pages.
