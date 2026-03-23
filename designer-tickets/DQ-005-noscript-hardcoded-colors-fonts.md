# DQ-005: Noscript blocks hardcode colors and font families

**Priority**: P2 — affects no-JS fallback (edge case but easy fix)
**Category**: CSS variable usage
**Files**: `frontend/lab.html:3155-3158`, `frontend/league-intel.html:1960-1963`, `frontend/agents.html:1604-1607`

## Problem

Three `<noscript>` blocks use hardcoded inline styles instead of CSS variables:
- `color:#6b5a4e` — should be `var(--ink-medium)`
- `color:#a89585` — should be `var(--ink-light)`
- `font-family:'Space Mono',monospace` — should be `var(--font-mono)`
- `font-family:'Caveat',cursive` — should be `var(--font-hand)`

These won't respect dark mode or any future token changes.

## Fix

Replace in all 3 files:
```html
<!-- Before -->
<div style="text-align:center; padding:48px 24px; font-family:'Space Mono',monospace; color:#6b5a4e;">

<!-- After -->
<div style="text-align:center; padding:48px 24px; font-family:var(--font-mono); color:var(--ink-medium);">
```

Same pattern for the Caveat paragraph — use `var(--font-hand)` and `var(--ink-light)`.

## Verification

View any of the 3 pages with JS disabled. Colors and fonts should match the design system.
