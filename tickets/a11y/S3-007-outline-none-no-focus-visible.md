# S3-007: outline:none on ~12 elements without :focus-visible alternative

**Severity**: S3 (Low)
**Category**: a11y
**Source**: EDGE-CASES.md #57
**WCAG**: 2.4.7
**Found**: 2026-03-14
**Status**: OPEN

## Root Cause

~12 elements use `outline: none` to remove the default focus ring but don't provide a `:focus-visible` alternative. Keyboard users lose all visual focus indication.

## Fix

Replace `outline: none` with `:focus-visible` pattern:
```css
.element:focus { outline: none; }
.element:focus-visible { outline: 2px solid var(--orange); outline-offset: 2px; }
```

## Files to Change

Search `frontend/` for `outline: none` or `outline:none` — update each occurrence.

## Accept When

All elements with `outline: none` have a `:focus-visible` rule with a visible focus indicator.
