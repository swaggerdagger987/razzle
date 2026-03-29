---
id: S2-078
severity: S2
confidence: HIGH
category: a11y
source: DQ-094,DQ-064,DQ-026
status: OPEN
---

# Sitewide :focus-visible gap — 121 :hover rules vs 5 :focus-visible in lab-panels.css

## Root Cause

`frontend/lab-panels.css` has 121 `:hover` rules but only 5 `:focus-visible` rules. Keyboard users get zero visual feedback when tabbing through interactive elements. Additionally:

- `frontend/agents.html` has 3 new `outline: none` without `:focus-visible` replacement (DQ-064)
- `frontend/styles.css` — cmd-palette-item and nav-dropdown-item missing `:focus-visible` (DQ-026)

## Fix

For each `:hover` rule in lab-panels.css that applies to interactive elements (buttons, links, clickable cards), add a matching `:focus-visible` rule with a `2px solid var(--orange)` outline. Batch approach:

```css
.lp-card:hover, .lp-card:focus-visible { /* existing hover styles */ }
```

## Files

- `frontend/lab-panels.css` — 121 hover rules need focus-visible counterparts
- `frontend/agents.html` — 3 outline:none instances
- `frontend/styles.css` — cmd-palette-item, nav-dropdown-item

## Acceptance Criteria

- Keyboard Tab through any lab-panels interactive element shows visible focus indicator
- No `outline: none` without `:focus-visible` replacement
