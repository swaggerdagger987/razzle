# DQ-280: Formula store toast uses border-radius:8px — should match chunky design

**Priority**: P3 — Minor visual inconsistency on toast notification
**Category**: Design Token
**Severity**: LOW — Toast appears briefly but doesn't match the chunky comic-strip aesthetic

## Problem

formula-store.js line 291: Toast notification uses `border-radius: 8px` with soft rounded corners. The Razzle design system uses chunky, angular elements. The toast already has `box-shadow: 4px 4px 0 var(--ink)` (correct chunky shadow) but the rounded radius softens the chunky effect.

```javascript
border-radius: 8px; ... box-shadow: 4px 4px 0 var(--ink);
```

Compare to other notifications in the system which use `var(--radius-sm)` (also 8px in the current token set, so this may already match — verify the token value).

## Fix

If `--radius-sm` is 8px, this is already on-token (just replace the hardcoded `8px` with `var(--radius-sm)` for consistency). If `--radius-sm` is different, update to match.

```javascript
border-radius: var(--radius-sm);
```

## Files
- `frontend/formula-store.js` line 291
