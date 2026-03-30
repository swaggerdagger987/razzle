---
id: DQ-098
title: opacity values fragmented — 12 distinct values with no semantic tokens
priority: P3
category: design-system
status: open
cycle: 13
---

## Problem

The codebase uses 12 different opacity values with no design system governance:

| Value | Count | Typical Usage |
|-------|-------|---------------|
| 0.7 | 35 | Secondary text, hover |
| 0.5 | 24 | Mid-range overlay |
| 0.6 | 18 | Secondary text, hover |
| 0.4 | 17 | Disabled states |
| 0.8 | 9 | Active states |
| 0.3 | 4 | Deep disabled, blink keyframe |
| 0.92 | 2 | Near-full |
| 0.9 | 2 | Near-full |
| 0.85 | 2 | Near-full |
| 0.45 | 2 | Between disabled and mid |
| 0.35 | 1 | Between disabled values |
| 0.15 | 1 | Very faint |

Same semantic concepts use different values: disabled buttons alternate between 0.3 and 0.4, hover states use 0.5/0.6/0.7/0.8, secondary text uses 0.6 and 0.7.

## Evidence

Code: `grep -rn "opacity:" frontend/` across all files. 12 distinct values, 115+ total instances.

## Fix

1. Define opacity tokens in styles.css:
   - `--opacity-faint: 0.15` — skeleton, ghost elements
   - `--opacity-disabled: 0.4` — all disabled states
   - `--opacity-secondary: 0.7` — secondary text, metadata
   - `--opacity-hover: 0.85` — hover overlays
   - `--opacity-full: 1` — primary content

2. Consolidate 12 values to 5 tokens. This is a gradual migration — start with new code, refactor existing over time.

## Files
- `frontend/styles.css` (define tokens)
- `frontend/agents.html` (heaviest inline opacity usage)
- `frontend/lab-panels.css`, `frontend/lab.html`, 30+ standalone pages
