---
id: S1-013
severity: S1
category: security
finding_ref: EDGE-22
confidence: HIGH
---

# S1-013: No per-email account lockout — distributed brute force possible

## Root Cause

`backend/server.py:81-101` — Rate limiting is keyed by IP address only:
```python
_rate_buckets = defaultdict(list)  # ip -> [timestamps]
```

`backend/server.py:863-867` — Login endpoint only checks IP:
```python
ip = _get_client_ip(request)
if not _check_rate_limit(ip):
    return JSONResponse({"error": "Too many attempts..."}, status_code=429)
```

An attacker with multiple IPs (botnet, VPN rotation, proxy list) can brute-force
a specific account's password by distributing 10 attempts per IP per minute across
hundreds of IPs. There is no per-email lockout.

## What to Fix

Add a secondary rate limiter keyed by email address:

```python
_email_rate_buckets = defaultdict(list)  # email -> [timestamps]
_EMAIL_RATE_LIMIT = 5  # max failed attempts per email
_EMAIL_RATE_WINDOW = 300  # per 5 minutes

def _check_email_rate_limit(email: str) -> bool:
    now = _time.time()
    bucket = _email_rate_buckets[email]
    _email_rate_buckets[email] = [t for t in bucket if now - t < _EMAIL_RATE_WINDOW]
    if len(_email_rate_buckets[email]) >= _EMAIL_RATE_LIMIT:
        return False
    return True  # Don't append yet — only append on FAILED login
```

In the login endpoint, AFTER verifying the password fails:
```python
_email_rate_buckets[email].append(_time.time())
```

And BEFORE attempting password verification:
```python
if not _check_email_rate_limit(email):
    return JSONResponse({"error": "Account temporarily locked..."}, status_code=429)
```

## Files to Change

- `backend/server.py` — Add `_email_rate_buckets`, `_check_email_rate_limit()`, update login endpoint

## Acceptance Criteria

- [ ] After 5 failed login attempts for the same email within 5 minutes, return 429
- [ ] Lockout applies regardless of source IP
- [ ] Successful login does NOT increment the counter
- [ ] Counter resets after the 5-minute window expires
- [ ] Same in-memory pattern as existing IP rate limiter (no new deps)

## Do NOT

- Do not add CAPTCHA (that's a separate ticket)
- Do not lock accounts permanently — use time-based window only
- Do not add Redis or external state (keep in-memory like existing limiters)
