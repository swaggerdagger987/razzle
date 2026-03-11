# Platform Loop — Phase 133 Task List

## Status
Current Phase: 133 (Backend Hardening + Caching + Free Trial + Promo Codes)
Current Task: COMPLETE
Current Stage: PHASE GATE
Attempt: -
Tasks Completed: 6/6
Loop Iterations: 6

---

## Task 1: Add response caching to high-traffic read endpoints
**Requirement**: "Add response caching to high-traffic endpoints... Reduces database load by 80%+ for popular endpoints" (Backend Audit, Priority Fix #5)
**Accept when**: At least 15 popular read-only endpoints have Cache-Control headers (max-age=300). In-memory function cache extended with LRU eviction (max 200 entries). Dynasty rankings, trade values, stat leaders, prospects, aging curves all cached.
**Depends on**: none
**Size**: M
**Primary role**: BACKEND
**Status**: PASS

## Task 2: Add structured logging with request timing middleware
**Requirement**: "Replace the scattered logger.info()/logger.error() calls with structured JSON logging that includes request IDs, endpoint names, and timing information" (Backend Audit, Priority Fix #7)
**Accept when**: FastAPI middleware logs request method, path, status code, and response time in milliseconds for every request. Structured JSON format. Errors include traceback context.
**Depends on**: none
**Size**: M
**Primary role**: BACKEND
**Status**: PASS (already implemented in Phase 131-132 — logging_config.py + request_logging_middleware)

## Task 3: Make bootstrap async (non-blocking server startup)
**Requirement**: "Instead of blocking server startup with data sync, either run the bootstrap in a background thread after the server starts responding, or make it a separate CLI command" (Backend Audit, Priority Fix #6)
**Accept when**: Server starts and responds to /api/health within 5 seconds of launch, even if data sync is still running. Bootstrap runs in background thread. Health check indicates bootstrap status.
**Depends on**: none
**Size**: M
**Primary role**: BACKEND
**Status**: PASS

## Task 4: Implement 7-day free trial for Pro/Elite subscriptions
**Requirement**: "Free trial (7 days)" (Pricing Strategy, ROADMAP Phase 9)
**Accept when**: Stripe checkout sessions include trial_period_days=7 for new subscribers. Trial status shown in billing status response. After trial expires, user reverts to free tier. Frontend shows trial status.
**Depends on**: none
**Size**: M
**Primary role**: BACKEND
**Status**: PASS

## Task 5: Implement promo code system (RAZZLE = 20% off)
**Requirement**: "Promo codes (RAZZLE = 20% off, early adopter rates)" (Pricing Strategy)
**Accept when**: Promo code input on pricing/checkout UI. RAZZLE code gives 20% off. Backend validates promo codes via Stripe coupons. Invalid codes show clear error. Promo applied to checkout session.
**Depends on**: Task 4
**Size**: M
**Primary role**: BACKEND
**Status**: PASS

## Task 6: UX polish — loading states, error states, and personality copy
**Requirement**: "Full UX polish pass: Loading states ('pulling film...'), error states, empty states, transitions" (ROADMAP Phase 9, Task 4)
**Accept when**: All major pages have Razzle-personality loading states. Error states show helpful messaging. Empty states guide users. 404 page has personality.
**Depends on**: none
**Size**: M
**Primary role**: FRONTEND
**Status**: PASS (already implemented across all pages — "pulling film...", "checking the tape...", "running the numbers...", 404 with mascot)
