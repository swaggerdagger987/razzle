# S3-049: CORS allows localhost origins if ENVIRONMENT env var missing

**Severity**: S3 (Low)
**Category**: Security / Configuration
**Source**: EDGE-CASES.md #21

## Problem

At `backend/server.py:451-453`, CORS origin list defaults to including localhost when the `ENVIRONMENT` variable is not explicitly set to `"production"`:

```python
_CORS_ORIGINS = ["https://razzle.lol"]
if os.environ.get("ENVIRONMENT", "development") != "production":
    _CORS_ORIGINS += ["http://localhost:8000", "http://localhost:5173", "http://127.0.0.1:8000"]
```

The default is `"development"`, so any deployment missing the env var allows localhost CORS.

## Current Mitigation

- `render.yaml` sets `ENVIRONMENT=production` (line confirmed in Phase 34 hardening)
- `allow_credentials` is not set (defaults to `False`), limiting cookie-based attacks
- Auth uses JWT in `Authorization` header, not cookies

## Residual Risk

If someone deploys the server outside Render (Docker, manual) and forgets `ENVIRONMENT=production`, localhost origins are silently allowed. An attacker running a local server on a victim's machine could make cross-origin API calls.

## Fix

Invert the default — only add localhost when explicitly in development:

```python
_CORS_ORIGINS = ["https://razzle.lol"]
if os.environ.get("ENVIRONMENT") == "development":
    _CORS_ORIGINS += ["http://localhost:8000", "http://localhost:5173", "http://127.0.0.1:8000"]
```

This makes the safe behavior the default.

## Acceptance Criteria

1. With no ENVIRONMENT set, only `https://razzle.lol` is allowed
2. With `ENVIRONMENT=development`, localhost origins are added
3. With `ENVIRONMENT=production`, only `https://razzle.lol` is allowed
