<!-- PM: ready -->
---
id: DQ-201
parent: RC-001 (Hardcoded Colors Bypass Design Tokens)
priority: P2
area: frontend/lab.js
section: design tokens
type: visual consistency
status: open
---

# Replace inline RGBA strings in getHeatColor() with design tokens

**File**: `frontend/lab.js`

## What's wrong

`getHeatColor()` contains ~12 hardcoded RGBA color strings for the heat map gradient. These are not tied to any CSS variable or design token, so they can't be themed and don't adapt to dark mode.

## What to do

1. Find `getHeatColor()` in lab.js
2. Identify all inline RGBA strings
3. Replace with values read from CSS custom properties or a theme-aware config object
4. Ensure heat colors still produce a readable gradient in both light and dark mode

## Accept when

- `getHeatColor()` reads color values from CSS vars or a centralized config (not inline strings)
- Heat map coloring works correctly in both light and dark mode
- No hardcoded `rgba(` strings remain inside `getHeatColor()`
