# S1-003: Five in-memory rate limiters reset on every restart

**Severity**: S1 (High)
**Category**: security
**Source**: EDGE-CASES.md #20
**Found**: 2026-03-14 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

`backend/server.py` — Five rate limiter dicts are plain `defaultdict(list)` at module scope. All state lost on app restart. With 2 Render workers, limits are per-process (attacker gets 2x the limit).

```python
# server.py:82
_rate_buckets = defaultdict(list)           # Auth: 10/60s

# server.py:105
_sensitive_rate_buckets = defaultdict(list)  # Billing/API key: 5/60s

# server.py:126
_screener_rate_buckets = defaultdict(list)   # Screener POST: 30/60s

# server.py:147
_reg_rate_buckets = defaultdict(list)        # Registration: 3/24h

# server.py:1068
_llm_rate_buckets = defaultdict(list)        # LLM: per-plan limits
```

## Impact

- Render free/standard restarts frequently (cold starts, deploys, auto-scaling)
- After restart, all rate limits reset — attacker gets fresh quota
- Registration limit (3/24h) is especially vulnerable: deploy = unlimited registrations
- Two workers mean limits are effectively doubled (requests alternate between processes)

## Fix

Option A (simple): Use SQLite `users.db` for rate tracking. Add a `rate_limits` table:
```sql
CREATE TABLE rate_limits (
    key TEXT NOT NULL,      -- "auth:192.168.1.1"
    bucket TEXT NOT NULL,    -- "auth", "sensitive", "screener", "registration", "llm"
    timestamp REAL NOT NULL,
    PRIMARY KEY (key, timestamp)
);
```
Periodic cleanup of old entries. Shared across workers.

Option B (lighter): Accept the limitation. Rate limiters are defense-in-depth, not the sole gate. Document the limitation and move on.

## Files to Change

- `backend/server.py:82-147,1068` — replace defaultdict with SQLite-backed storage (Option A)
- OR add a `<!-- known limitation -->` comment (Option B)

## Accept When

Option A: Rate limits survive app restarts and are shared across workers.
Option B: Comment documents the limitation and monitoring alerts on restart frequency.

## Do NOT Touch

- Rate limit thresholds (10/60s, 5/60s, etc.) — those are tuned correctly
- `_get_client_ip()` — that function is correct (uses X-Forwarded-For)
