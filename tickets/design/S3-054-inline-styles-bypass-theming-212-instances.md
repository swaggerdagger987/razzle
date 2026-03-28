---
id: S3-054
severity: S3
confidence: HIGH
category: design
source: DQ-120,DQ-114,DQ-070
status: OPEN
---

# 212+ style.property DOM writes + 37 inline style attrs bypass theming cascade

## Root Cause

Three related patterns undermine the design system:

1. **DQ-120**: 212 instances of `el.style.property = value` across JS files write CSS directly to DOM elements, bypassing CSS variables and dark mode overrides.

2. **DQ-114**: Multiple JS functions use `el.style.cssText = "..."` with mega-strings containing hardcoded colors and sizes.

3. **DQ-070**: agents.html has 37 long `style=""` attributes on HTML elements.

These patterns make dark mode, responsive design, and design token updates impossible for the affected elements.

## Fix

Migrate inline styles to CSS classes. For dynamic values (positioning, computed sizes), use CSS custom properties:
```js
el.style.setProperty('--offset-x', x + 'px');
```

Priority: Focus on visible user-facing elements first (cards, badges, labels), not positioning hacks.

## Files

- `frontend/lab.js` — highest concentration
- `frontend/lab-panels.js` — numerous
- `frontend/agents.html` — 37 inline style attrs
- `frontend/warroom.js` — canvas-adjacent DOM

## Acceptance Criteria

- No hardcoded colors in `style.cssText` or `style.property` assignments
- Inline styles limited to truly dynamic values (position, size)
