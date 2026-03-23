---
id: DQ-252
title: Auth form fields set aria-invalid but have zero visual styling for invalid state
priority: P1
category: conversion / auth UX
status: open
cycle: 35
---

## Problem

When registration/login validation fails, `app.js` (lines 962-1017) correctly sets `aria-invalid="true"` on the failing input fields. But there is NO CSS rule to visually indicate the error. Users see the error text below the form but the field itself looks normal — no red border, no background tint, nothing.

This affects the auth conversion flow directly.

## Evidence

- `app.js` lines 997-1000: sets `aria-invalid="true"` on password fields for mismatch/too-short/missing-letter/missing-number
- `grep -r "aria-invalid" frontend/styles.css` returns 0 results
- `.auth-form input:focus-visible` has orange ring (line ~730), but no `[aria-invalid]` rule exists

## Fix

Add to `frontend/styles.css` near the `.auth-form input:focus-visible` rule:
```css
.auth-form input[aria-invalid="true"] {
  border-color: var(--red);
  box-shadow: 0 0 0 2px var(--red-light);
}
```

## Files
- `frontend/styles.css` — add 1 rule (~3 lines)

## Impact
Auth conversion. Users who mistype passwords see no field-level feedback. 3-line CSS fix.
