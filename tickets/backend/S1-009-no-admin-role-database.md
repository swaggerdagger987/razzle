# S1-009: No admin role in database — admin uses shared secret header

**Severity**: S1 (High)
**Category**: missing-feature
**Source**: EDGE-CASES.md #1
**Found**: 2026-03-14 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

`backend/auth.py:95-102` — Users table has no `is_admin` column:

```sql
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    sleeper_username TEXT,
    plan TEXT DEFAULT 'free',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Admin endpoints exist (server.py:3349 `/api/admin/stats`, server.py:3380 `/api/admin/cache-clear`) but authenticate via `x-admin-secret` header against an environment variable. No per-user admin flag.

## Impact

- Owner cannot see users, revenue, subscriptions, or analytics through a web UI
- Cannot ban abusers, grant press access, or manage individual accounts
- Admin secret is shared (anyone with the secret has full admin access)
- No audit trail of admin actions

## Fix

1. Add `is_admin` boolean column to users table (default 0)
2. Add `RAZZLE_ADMIN_EMAIL` env var — auto-promote this email on register/login
3. Add `/api/admin/*` endpoints: user list, plan override, account disable
4. Admin endpoints check JWT + `is_admin` flag (not just header secret)

## Files to Change

- `backend/auth.py:95-102` — add `is_admin` column + migration
- `backend/auth.py` — add `is_admin` check helper
- `backend/server.py:3349-3380` — replace `x-admin-secret` with JWT + is_admin
- `frontend/` — admin dashboard page (future, not blocking)

## Accept When

1. `is_admin` column exists in users table
2. Admin email env var auto-promotes matching user
3. At least: `/api/admin/users` (list users), `/api/admin/user/{id}/plan` (change plan)
4. Admin endpoints require both valid JWT and `is_admin=1`

## Do NOT Touch

- `x-admin-secret` endpoints — keep as fallback until admin UI is built
- User registration flow — is_admin is set by env var, not self-service
