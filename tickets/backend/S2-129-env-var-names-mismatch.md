---
severity: S2
confidence: HIGH
category: backend-config
source: go-live-audit-2026-03-29
audit_ref: "Finding 5: Env validation checks wrong Stripe variable names"
---

# Env validation checks _ANNUAL but billing code reads _YEARLY

## What's Wrong

The startup env validation in `_validate_env()` checks for `STRIPE_PRICE_PRO_ANNUAL` and `STRIPE_PRICE_ELITE_ANNUAL`, but the actual billing code in `billing.py` reads `STRIPE_PRICE_PRO_YEARLY` and `STRIPE_PRICE_ELITE_YEARLY`.

This means:
- If you set the correct `_YEARLY` vars, startup validation warns they're missing (false alarm)
- If you set the `_ANNUAL` vars that validation expects, billing silently fails (wrong var names)
- Incident response is slower because the startup log misleads you

## Root Cause

**File**: `backend/server.py:480` — `("STRIPE_PRICE_PRO_ANNUAL", False, "Pro annual checkout disabled")`
**File**: `backend/server.py:482` — `("STRIPE_PRICE_ELITE_ANNUAL", False, "Elite annual checkout disabled")`
**File**: `backend/billing.py:23` — `STRIPE_PRICE_PRO_YEARLY = os.environ.get("STRIPE_PRICE_PRO_YEARLY", "")`
**File**: `backend/billing.py:25` — `STRIPE_PRICE_ELITE_YEARLY = os.environ.get("STRIPE_PRICE_ELITE_YEARLY", "")`

## The Fix

**File**: `backend/server.py:480` — change `STRIPE_PRICE_PRO_ANNUAL` to `STRIPE_PRICE_PRO_YEARLY`
**File**: `backend/server.py:482` — change `STRIPE_PRICE_ELITE_ANNUAL` to `STRIPE_PRICE_ELITE_YEARLY`

Two-line fix. Make the validation match what the billing code actually reads.

## Acceptance Criteria

- [ ] `_validate_env()` checks `STRIPE_PRICE_PRO_YEARLY` (not `_ANNUAL`)
- [ ] `_validate_env()` checks `STRIPE_PRICE_ELITE_YEARLY` (not `_ANNUAL`)
- [ ] Grep for `_ANNUAL` in the entire backend — should return zero hits (unless there's an `_ANNUAL` var somewhere else that's intentional)
- [ ] `python functional-qa/tests/smoke.py` passes

## Context

Go-live audit finding. Low risk but high confusion during incident response. Two-line fix.
