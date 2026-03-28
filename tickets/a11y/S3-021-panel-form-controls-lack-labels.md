# S3-021: Panel page form controls lack labels

**Severity**: S3 (Low)
**Category**: a11y
**Source**: 2026-03-14-a11y-audit.md #19
**WCAG**: 1.3.1, 3.3.2
**Found**: 2026-03-14 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

Zero `<label>` elements exist across all 74 HTML files. Form controls on panel pages (season selectors, team/position selectors, search inputs) rely on visual proximity or placeholder text as their only label. Screen readers cannot programmatically determine the purpose of these controls.

Some pages DO use `aria-label` (e.g., `advantage.html:90` has `aria-label="Season"`) but this is inconsistent.

## Fix

Add `aria-label` to every form control that lacks a `<label>` element. Pattern:
```html
<!-- Selects -->
<select aria-label="Season">...</select>
<select aria-label="Position">...</select>
<select aria-label="Team">...</select>

<!-- Search inputs -->
<input type="text" aria-label="Search players" placeholder="Search..." />
```

Ideally use `<label for="id">` with visible labels, but `aria-label` is acceptable for compact control bars.

## Files to Change

All 60+ panel pages with form controls. Typical pattern: each page has 1-3 select/input elements in a filter/control bar at the top.

## Accept When

1. Every `<select>` and `<input>` element in panel pages has either a `<label>` with `for` attribute or an `aria-label`
2. `grep -r '<select' frontend/*.html | grep -v aria-label | grep -v '<label'` returns zero results
