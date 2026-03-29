# S2-045: btn-chunky has no dark mode override

**Severity**: S2 (Medium)
**Category**: design
**Source**: designer-tickets/DQ-085
**Found**: 2026-03-28
**Status**: OPEN

## Root Cause

`frontend/styles.css:753-779` — `.btn-chunky` uses `background: var(--bg-card)` and `color: var(--ink)`. While the CSS variables flip in dark mode (`--bg-card` → `#4a3728`, `--ink` → `#ede0cf`), there is no explicit `[data-theme="dark"] .btn-chunky` override to optimize contrast, shadow visibility, or border treatment.

The "Sign In" button appears on every page via `app.js` nav injection. In dark mode, the button's visual weight is reduced because:
- Background blends with the dark page background
- The 2px box-shadow is less visible
- No border-color adjustment

## Fix

Add dark mode override for `.btn-chunky` in styles.css:
```css
[data-theme="dark"] .btn-chunky {
  border-color: var(--ink-light);
  box-shadow: 4px 4px 0 var(--ink-light);
}
```

## Files to Change

- `frontend/styles.css` — add `[data-theme="dark"] .btn-chunky` rule after line 779

## Accept When

1. Sign In button clearly visible in dark mode on all pages
2. Button shadow visible against dark background
3. No regression in light mode
