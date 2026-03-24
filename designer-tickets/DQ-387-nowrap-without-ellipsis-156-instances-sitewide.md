---
id: DQ-387
title: white-space:nowrap without text-overflow:ellipsis — 156 instances across 69 files
priority: P2
category: mobile / overflow
page: sitewide (69 files)
status: open
cycle: 50
---

## Problem

156 CSS rules use `white-space: nowrap` without a corresponding `text-overflow: ellipsis; overflow: hidden;` fallback. On mobile or narrow viewports, long player names, stat labels, or team names can overflow their containers and break layouts.

DQ-104 covered this pattern in lab-panels only. This ticket expands to full sitewide scope.

## Evidence

- Total `white-space: nowrap` instances: 221 across 69 files
- Instances WITH `text-overflow: ellipsis`: 65 (29%)
- Instances WITHOUT ellipsis: 156 (71%)
- Top offenders:
  - `lab-panels.css`: 68 instances (table headers, badges, labels)
  - `lab.html`: 22 instances (column headers, controls)
  - `league-intel.html`: 9 instances (roster grid, manager names)
  - 17 standalone pages: 1-5 instances each (table headers)

## Fix

For each `white-space: nowrap` rule, add overflow handling:

```css
/* Before */
.some-header { white-space: nowrap; }

/* After */
.some-header { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
```

Exceptions: elements inside `overflow-x: auto` containers (table cells in scrollable tables) can keep nowrap without ellipsis since the container scrolls.

Start with:
1. `lab-panels.css` (68 instances, highest impact)
2. `lab.html` (22 instances)
3. `league-intel.html` (9 instances)

## Verification

1. Set viewport to 375px width
2. Navigate through Lab panels, league intel, standalone pages
3. No text should overflow its container — should truncate with ellipsis or be inside a scrollable container
