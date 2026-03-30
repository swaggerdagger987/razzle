---
severity: S1
confidence: HIGH
category: security
source: go-live-audit-2026-03-29
audit_ref: "Finding 4: Rate limiter fails open on DB errors"
---

# Rate limiter fails open on DB errors — sensitive endpoints unprotected

## What's Wrong

The rate limiter silently returns `True` (allow) when any database exception occurs:

```python
except Exception:
    logger.debug("Rate limit check failed, allowing request", exc_info=True)
    return True  # fail open — don't block users on DB errors
```

This is used for sensitive endpoints including `POST /api/billing/create-checkout` (`server.py:1134`). If `users.db` is degraded, locked, or on a slow disk, all rate limiting disappears — enabling brute-force attacks on login, abuse of checkout, and API scraping.

## Root Cause

**File**: `backend/server.py:138-140`

```python
except Exception:
    logger.debug("Rate limit check failed, allowing request", exc_info=True)
    return True  # fail open
```

**Used at**: `backend/server.py:1134` (checkout), and likely login, register, and other sensitive routes.

## The Fix

**For sensitive routes**: fail closed (deny the request) when the rate limiter DB is unavailable. Better to temporarily block a legitimate user than to leave auth/billing endpoints unprotected.

**For non-sensitive routes** (like `/api/players`): failing open is acceptable — don't break the read experience because of a rate limit DB issue.

Create two functions:

**File**: `backend/server.py` — replace current `_check_rate_limit` catch block:

```python
def _check_rate_limit(bucket, key, limit, window):
    """Rate check for non-sensitive routes. Fails OPEN."""
    try:
        # ... existing logic ...
    except Exception:
        logger.warning("Rate limit check failed (fail-open), allowing request", exc_info=True)
        return True

def _check_sensitive_rate(key, limit=10, window=60):
    """Rate check for auth/billing routes. Fails CLOSED."""
    try:
        return _check_rate_limit("sensitive", key, limit, window)
    except Exception:
        logger.error("Rate limit check failed (fail-closed), blocking request", exc_info=True)
        return False
```

Then use `_check_sensitive_rate` for checkout, login, register, password-reset. Use `_check_rate_limit` for everything else.

## Acceptance Criteria

- [ ] Sensitive endpoints (checkout, login, register, password-reset) fail CLOSED when rate limit DB errors
- [ ] Non-sensitive endpoints (players, screener, health) still fail OPEN
- [ ] Logger level is `warning` for fail-open, `error` for fail-closed
- [ ] `python functional-qa/tests/smoke.py` passes
- [ ] Existing rate limit tests still pass

## Context

Security finding from go-live audit. On launch day, if the users.db disk gets slow under load, rate limiting disappears for the most sensitive endpoints. Fail-closed on sensitive routes is standard practice.
