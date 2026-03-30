---
id: DQ-080
priority: P3
category: typography
status: open
---

# DQ-080: letter-spacing used 76 times with no design system guidance

## Problem
DESIGN.md does not specify any letter-spacing values, yet the codebase uses `letter-spacing` **76 times** across 20+ files with 5 different values:
- `letter-spacing: 1px` — ~25 instances (uppercase labels)
- `letter-spacing: 0.5px` — ~40 instances (smaller uppercase text)
- `letter-spacing: -1px` — 2 instances (display headings in agents.html, index.html)
- `letter-spacing: 2px` — 1 instance (agents.html:249, wide scenario badge)
- `letter-spacing: 0.05em` — 2 instances (lab.html)

Heaviest files:
- `agents.html`: 18 instances
- `lab.html`: 16 instances
- `lab-panels.css`: 6 instances

## Fix
Add letter-spacing tokens to DESIGN.md and styles.css:
```css
--ls-tight: -0.5px;   /* display headings only */
--ls-normal: 0;        /* default */
--ls-caps: 0.5px;      /* uppercase labels */
--ls-wide: 1px;        /* uppercase section headers */
```

Then standardize:
- `0.5px` stays (approved as `--ls-caps`)
- `1px` stays (approved as `--ls-wide`)
- `-1px` -> `-0.5px` (less aggressive negative tracking)
- `2px` -> `1px` (too wide, use `--ls-wide`)
- `0.05em` -> `0.5px` (normalize units)

## Scope
76 instances across 20+ files. Define tokens first, then standardize.
