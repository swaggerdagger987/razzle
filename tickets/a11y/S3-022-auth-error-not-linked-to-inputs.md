# S3-022: Auth error messages not associated with form inputs

**Severity**: S3 (Low)
**Category**: a11y
**Source**: 2026-03-14-a11y-audit.md #20
**WCAG**: 3.3.1 (Error Identification)
**Found**: 2026-03-14 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

Auth error messages are displayed in `<div>` elements with IDs (`authLoginError`, `authRegisterError`) in `frontend/app.js` around lines 543 and 550. These divs are NOT linked to form inputs via `aria-describedby`. The error text is injected dynamically but screen readers may not announce it.

## Fix

1. Add `aria-describedby="authLoginError"` to the email input in the login form
2. Add `aria-describedby="authRegisterError"` to the email input in the register form
3. Add `role="alert"` to both error divs so changes are announced immediately

In app.js auth modal HTML generation:
```javascript
// Login form inputs:
'<input ... id="authLoginEmail" aria-describedby="authLoginError" />'
// Error div:
'<div id="authLoginError" role="alert" class="auth-error"></div>'
```

## Files to Change

- `frontend/app.js` — auth modal HTML generation (around lines 540-560)

## Accept When

1. Auth error divs have `role="alert"`
2. Form inputs have `aria-describedby` pointing to their error div
3. Screen readers announce error messages when they appear
