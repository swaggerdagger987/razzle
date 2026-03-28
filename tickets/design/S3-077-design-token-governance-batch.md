---
id: S3-077
severity: S3
confidence: MEDIUM
category: design-system
source: DQ-158+198+199+204+320+321+322+183
status: OPEN
---

# Design token governance batch — z-index, font-weight, line-height, transitions, breakpoints

## Root Cause

Multiple CSS property categories use ungoverned raw values instead of design tokens:

1. **z-index hierarchy ungoverned** — sitewide: z-index values scattered across files with no central registry; stacking conflicts possible (DQ-158)
2. **font-weight bold keyword not numeric** — sitewide: `font-weight: bold` instead of `700` creates inconsistency with variable font support (DQ-198)
3. **line-height px values not unitless** — sitewide: `line-height: 18px` instead of unitless `1.5` doesn't scale with font-size changes (DQ-199)
4. **Media breakpoints ungoverned** — sitewide: 6 different breakpoint values used (480, 600, 640, 768, 900, 1024px) without CSS custom properties (DQ-204)
5. **Transition duration fragmentation** — sitewide: 5 different duration values (0.15s, 0.2s, 0.25s, 0.3s, 0.35s) with no tokens (DQ-320)
6. **Progress bar easing inconsistent** — sitewide: multiple easing functions used with no standard (DQ-321)
7. **Unused keyframes dead code** — `frontend/agent-nudges.js`: nudgeFadeIn keyframes defined but never used (DQ-322)
8. **No color-scheme for native controls** — sitewide: `color-scheme: dark` not set on `<html>` in dark mode, browser form controls remain light (DQ-183)

## Fix

Define CSS custom properties for z-index scale, transition timing, and breakpoints. Replace raw values sitewide. Remove dead keyframes.

## Files

- `frontend/styles.css` — add token definitions
- Sitewide — replace raw values with tokens
- `frontend/agent-nudges.js` — remove dead keyframes

## Acceptance Criteria

- z-index values use named tokens (--z-modal, --z-tooltip, etc.)
- Transition durations use 2-3 standard tokens
- Dead animation code removed
- `color-scheme: dark` set when dark mode active
