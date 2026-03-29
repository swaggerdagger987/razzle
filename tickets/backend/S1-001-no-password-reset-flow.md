# S1-001: No password reset flow — users locked out permanently

**Severity**: S1 (High)
**Category**: missing-feature
**Source**: EDGE-CASES.md #2
**Found**: 2026-03-14 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

`backend/auth.py` — Zero password reset functions, endpoints, or email-sending code exist. Searched the entire `backend/` directory for "password.*reset", "forgot.*password", "reset.*token", "sendmail", "smtp", "EmailMessage" — zero matches.

The `register()` function (auth.py:309-348) creates accounts and immediately returns a JWT. No email verification, no recovery path.

## Impact

- A paying user who forgets their password is locked out permanently
- No way to contact users (no verified email)
- Will cause chargebacks from paying customers who can't access their accounts
- Makes "Email already registered" errors unrecoverable

## Fix

1. Add email integration (SendGrid/Resend free tier, ~100 emails/day)
2. Add `/api/auth/forgot-password` endpoint that generates a time-limited reset token and emails it
3. Add `/api/auth/reset-password` endpoint that validates token and updates password
4. Add `password_reset_token` and `password_reset_expires` columns to users table

## Files to Change

- `backend/auth.py` — add reset token generation, validation, password update functions
- `backend/server.py` — add `/api/auth/forgot-password` and `/api/auth/reset-password` endpoints
- `frontend/app.js` — add "Forgot password?" link to auth modal
- `requirements.txt` or equivalent — add email SDK dependency

## Accept When

1. User can click "Forgot password?" in auth modal
2. Email with reset link is sent to registered email
3. Reset link opens a form to set new password
4. Reset tokens expire after 1 hour
5. Used tokens cannot be reused

## Do NOT Touch

- Existing login/register flow — add alongside, don't modify
- JWT token generation — reset flow should use the existing `_create_token()`
