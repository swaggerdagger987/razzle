---
id: DQ-092
title: line-height fragmented — 21 distinct values with no design tokens
priority: P2
category: design-system
status: open
cycle: 13
---

## Problem

The codebase uses 21 different line-height values with no design system governance:

**Unitless:** 1, 1.1, 1.15, 1.2, 1.3, 1.35, 1.4, 1.5, 1.6, 1.7, 1.9
**Pixel-based:** 14px, 18px, 26px, 30px

This creates inconsistent vertical rhythm across pages. Sections built at different times have visibly different text density. DESIGN.md defines a type scale for font-size but has no line-height guidance.

## Evidence

Code: `grep -rn "line-height:" frontend/` returns hits across lab-panels.css (428, 490, 574), styles.css, agents.html, lab.html, 30+ standalone pages. Mixing unitless and px-based values means components behave differently when font-size changes.

## Fix

1. Define 4 line-height tokens in styles.css `:root`:
   - `--lh-tight: 1.1` — badges, chips, single-line labels
   - `--lh-normal: 1.4` — body text, data rows
   - `--lh-relaxed: 1.6` — paragraphs, descriptions
   - `--lh-loose: 1.8` — large display text, hero copy

2. Consolidate the 21 values to the nearest token. Eliminate all px-based line-heights.

## Files
- `frontend/styles.css` (define tokens)
- `frontend/lab-panels.css` (heaviest usage)
- `frontend/agents.html`, `frontend/lab.html`, 30+ standalone pages
