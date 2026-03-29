# S2-041: No error monitoring service (Sentry/equivalent)

**Severity**: S2 (High)
**Category**: performance
**Source**: EDGE-CASES.md #14
**Found**: 2026-03-14 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

No error monitoring service is integrated. All errors log to stdout via `backend/logging_config.py` and are lost when Render log buffer rotates. No alerting, no crash tracking, no error aggregation.

**Evidence**:
- `requirements.txt` — no `sentry-sdk`, `datadog`, `bugsnag`, or any monitoring package
- `backend/server.py:706-719` — global exception handler calls `logger.exception()` to stdout only
- `backend/logging_config.py` — JSON formatter outputs to `sys.stdout`, no external sinks
- `backend/billing.py:98-118` — multiple `ALTER TABLE` exceptions swallowed with `logger.debug()` (not even ERROR level)
- `backend/billing.py:200-206` — trial info retrieval failure silent at debug level
- `backend/billing.py:420-426` — Stripe subscription trial retrieval swallowed at debug level

## Fix

1. Add `sentry-sdk[fastapi]` to `requirements.txt`
2. Initialize Sentry in `backend/server.py` startup:
   ```python
   import sentry_sdk
   if os.environ.get("SENTRY_DSN"):
       sentry_sdk.init(dsn=os.environ["SENTRY_DSN"], environment=ENVIRONMENT, traces_sample_rate=0.1)
   ```
3. Add `SENTRY_DSN` env var to `render.yaml` (value set in Render dashboard)
4. Add `SENTRY_DSN=` to `.env.example`
5. Upgrade billing.py debug-level exception handlers to WARNING/ERROR level:
   - `billing.py:98-118` — `logger.debug` → `logger.warning` for ALTER TABLE failures
   - `billing.py:200-206` — `logger.debug` → `logger.warning` for trial retrieval
   - `billing.py:420-426` — `logger.debug` → `logger.warning` for Stripe trial

## Files to Change

- `requirements.txt` — add `sentry-sdk[fastapi]`
- `backend/server.py` — add Sentry init (3-5 lines at startup)
- `render.yaml` — add `SENTRY_DSN` env var placeholder
- `.env.example` — add `SENTRY_DSN=`
- `backend/billing.py:98,200,420` — upgrade 3 debug-level exception handlers

## Accept When

1. Sentry SDK initializes on startup when `SENTRY_DSN` env var is set
2. Unhandled exceptions in endpoints are reported to Sentry
3. billing.py swallowed exceptions log at WARNING or ERROR level
4. No Sentry initialization error when env var is absent (graceful skip)

## Do NOT Touch

- `backend/logging_config.py` — stdout logging should remain as-is (Sentry supplements, doesn't replace)
- Any endpoint logic — this is infrastructure only
