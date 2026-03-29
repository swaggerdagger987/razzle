# S3-039: Noscript blocks use hardcoded colors and font families

**Severity**: S3 (Low)
**Category**: design
**Source**: designer-tickets DQ-005
**Found**: 2026-03-25 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

Three noscript blocks use hardcoded hex colors and font-family strings instead of CSS variables. Since `<noscript>` content renders when JS is disabled, CSS custom properties defined in JS-loaded stylesheets DO still work (CSS vars are pure CSS, not JS). These can safely use CSS variables.

**Locations**:
```html
<!-- lab.html:3161 -->
<div style="... font-family:'Space Mono',monospace; color:#6b5a4e;">
  <p style="font-family:'Luckiest Guy',cursive; ...">
  <p style="font-family:'Caveat',cursive; ... color:#a89585;">

<!-- league-intel.html:~1960 (same pattern) -->
<!-- agents.html:~1604 (same pattern) -->
```

**Issues**:
- `#6b5a4e` is close to but not `var(--ink-medium)` (#5c4a3d)
- `#a89585` is close to but not `var(--ink-light)` (#8a7565)
- Hardcoded font strings instead of `var(--font-mono)`, `var(--font-display)`, `var(--font-hand)`

## Fix

Replace inline styles in all 3 noscript blocks:
```html
<div style="text-align:center; padding:48px 24px; font-family:var(--font-mono); color:var(--ink-medium);">
  <p style="font-family:var(--font-display); font-size:24px; margin-bottom:12px;">JavaScript required</p>
  <p>...</p>
  <p style="font-family:var(--font-hand); font-size:18px; margin-top:16px; color:var(--ink-light);">...</p>
</div>
```

## Files to Change

- `frontend/lab.html:3161-3164` — 3 style attribute updates
- `frontend/league-intel.html:~1960-1963` — same 3 updates
- `frontend/agents.html:~1604-1607` — same 3 updates

## Accept When

1. All 3 noscript blocks use CSS variables for colors and fonts
2. No hardcoded hex colors in any noscript block
3. Noscript content still renders correctly when JS is disabled
4. Dark mode: noscript text adapts to dark theme

## Do NOT Touch

- Noscript message text/copy
- Whether noscript blocks exist (they should remain)
