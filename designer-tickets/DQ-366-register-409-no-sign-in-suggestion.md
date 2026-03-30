---
id: DQ-366
title: Register 409 (email exists) doesn't suggest "try signing in instead"
priority: P3
category: UX / auth
page: app.js
cycle: 47
---

## Problem

When a user tries to register with an email that already exists, the backend returns 409 and the frontend shows an error message. But the error doesn't suggest the obvious next action: "This email is already registered — try signing in instead."

Currently the user sees the error, has `aria-invalid` on the email field, and must manually click the "Sign In" tab. No bridge between the error and the recovery action.

## How users hit this

- Forgot they already registered
- Used different auth method (social vs email)
- Re-visiting after months, don't remember if they created an account

## Fix

In the register error handler, when status is 409:
1. Show message: "This email is already registered. [Sign in instead →]"
2. Make "Sign in instead" a clickable link that switches to the Sign In tab and pre-fills the email
3. Clear the error state on the register form

## Files
- `frontend/app.js` (line ~1007, register error handler)
