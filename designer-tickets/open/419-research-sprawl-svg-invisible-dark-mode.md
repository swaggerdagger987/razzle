# DQ-419: research-sprawl.svg has hardcoded light colors, invisible in dark mode

**Priority**: P2
**Category**: Dark Mode / Visual
**Files**: `frontend/assets/research-sprawl.svg`

## Problem

The research-sprawl.svg illustration uses hardcoded light-mode colors that disappear on dark backgrounds:

| Line | Element | Current Color | Problem |
|------|---------|--------------|---------|
| 9 | Background rect | `fill="#f7efe5"` | Cream on dark espresso = barely visible |
| 112 | Thought bubble | `fill="white"` | White on dark = invisible |
| 116 | Thought bubble | `fill="white"` | Same |
| 120 | Thought bubble | `fill="white"` | Same |
| 22-23 | Knot strokes | `stroke="#c4b5a5"` | Faint brown on dark = too subtle |

SVG is a static file — it cannot use CSS variables.

## What the user sees

In dark mode, the illustration renders as mostly invisible elements: white thought bubbles disappear, cream background merges with page, faint strokes vanish.

## Fix

Options:
1. Embed a `<style>` block inside the SVG with `@media (prefers-color-scheme: dark)` overrides
2. Use two SVG variants and swap via CSS `content` or `background-image`
3. Wrap in HTML with `[data-theme="dark"]` CSS overrides using `filter: invert()` or similar
