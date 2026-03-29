# S3-006: Auth form inputs have placeholder-only labels — no <label> or aria-label

**Severity**: S3 (Low)
**Category**: a11y
**Source**: EDGE-CASES.md #56
**WCAG**: 1.3.1, 3.3.2
**Found**: 2026-03-14
**Status**: OPEN

## Root Cause

Auth modal inputs (email, password) use placeholder text as the only label. No `<label>` elements, no `aria-label` attributes. Screen readers announce these as unlabeled inputs.

## Fix

Add `aria-label` to each auth form input:
```html
<input type="email" aria-label="Email address" placeholder="email@example.com" ...>
<input type="password" aria-label="Password" placeholder="password" ...>
```

Or wrap with `<label>` elements.

## Files to Change

- `frontend/app.js` — auth modal HTML generation (search for `type="email"` and `type="password"`)

## Accept When

All auth form inputs have either `<label>` or `aria-label`. Screen reader announces field purpose.
