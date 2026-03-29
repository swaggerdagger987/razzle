# S1-002: No email verification — unlimited trial abuse via fake emails

**Severity**: S1 (High)
**Category**: security
**Source**: EDGE-CASES.md #17
**Found**: 2026-03-14 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

`backend/auth.py:309-348` — `register()` immediately grants a 7-day Pro trial with zero email verification. Only validation is `EMAIL_REGEX.match(email)` which accepts syntactically valid but fake addresses.

```python
# auth.py:309-348
def register(email: str, password: str) -> dict:
    email = email.strip().lower()
    if not EMAIL_REGEX.match(email):
        return {"error": "Invalid email format", "status": 400}
    # ... immediately creates account with pro trial
    cursor = conn.execute(
        "INSERT INTO users (email, password_hash, trial_start, trial_end, trial_used) VALUES (?, ?, ?, ?, 1)",
        (email, password_hash, trial_start, trial_end),
    )
```

No `email_verified` column in users table (auth.py:95-102). No verification token. No confirmation email.

## Impact

- Attacker can register unlimited trial accounts with `fake1@test.com`, `fake2@test.com`, etc.
- Each gets 7 days of Pro access
- Rate limiting only covers IP (3 registrations/24h per IP), trivially bypassed with proxies
- Password reset (S1-001) is impossible without verified email

## Fix

1. Add `email_verified` boolean column to users table (default 0)
2. On register, send verification email with one-time token
3. Until verified, account gets free tier (not pro trial)
4. Trial starts when email is verified, not when registered
5. Prerequisite: email integration from S1-001

## Files to Change

- `backend/auth.py:95-102` — add `email_verified` column
- `backend/auth.py:309-348` — send verification email, don't grant trial immediately
- `backend/server.py` — add `/api/auth/verify-email` endpoint
- `frontend/app.js` — show "check your email" message after registration

## Accept When

1. New registration shows "check your email to verify" instead of logging in
2. Clicking verification link activates account and starts trial
3. Unverified accounts cannot use Pro features
4. Verification tokens expire after 24 hours

## Do NOT Touch

- Existing user accounts — they should be grandfathered as verified
- Login flow for existing users — only new registrations require verification
