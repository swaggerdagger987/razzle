<!-- PM: ready -->
# DQ-466: lab.js PNG Export Reads style.background with Hardcoded Hex Fallbacks

**Priority**: P2
**Category**: Design Token / Export
**Affects**: frontend/lab.js

## Problem

The PNG export code (~lines 7826-8199) reads element `.style.background` values and uses hardcoded hex fallbacks when the style is missing. If an element doesn't have an inline background, the export uses a literal hex instead of reading from the design system.

## Violations

```javascript
const tierColor = tierBadge?.style.background || "#ffc857";   // should use CSS var
const barColor = bar ? bar.style.background : "#c4b5a5";      // hardcoded ink-faint
const simBg = simEl?.style.background || "#2ec4b6";            // hardcoded green
const badgeColor = badge.style.background || "#8a7565";        // hardcoded ink-light
```

4 hardcoded fallback colors that won't follow theme changes.

## Fix

Replace fallbacks with `getComputedStyle(document.documentElement).getPropertyValue('--yellow')` pattern, or use `getCanvasTheme()` which already centralizes design tokens for canvas rendering.

## Acceptance

No hardcoded hex fallbacks in PNG export section. All fallbacks use CSS variable lookups.
