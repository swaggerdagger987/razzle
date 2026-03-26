<!-- PM: ready -->
---
id: DQ-200
parent: RC-001 (Hardcoded Colors Bypass Design Tokens)
priority: P2
area: frontend/lab.js
section: design tokens
type: visual consistency
status: open
---

# Replace cold canvas overlay colors with warm design token tints

**File**: `frontend/lab.js`

## What's wrong

Canvas overlay code uses cold `rgba(0,0,0,...)` and `rgba(255,255,255,...)` for overlays and backgrounds. These produce a blue-grey tone that clashes with the warm Anthropic sand palette.

## What to do

1. Find all `rgba(0,0,0` and `rgba(255,255,255` in canvas/overlay code in lab.js
2. Replace with warm equivalents derived from the design tokens:
   - Dark overlay: `rgba(45,31,20,0.5)` (espresso-based) instead of `rgba(0,0,0,0.5)`
   - Light overlay: `rgba(237,224,207,0.5)` (sand-based) instead of `rgba(255,255,255,0.5)`
3. Use `getCanvasTheme()` if available, or read from CSS vars

## Accept when

- Zero `rgba(0,0,0` or `rgba(255,255,255` in canvas/overlay sections of lab.js
- Overlays have a warm brown/sand tone in both light and dark mode
- No visual regression in overlay readability
