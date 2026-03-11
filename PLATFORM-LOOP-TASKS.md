# Platform Loop — Phase 147 Task List

## Status
Current Phase: 147 (Pre-Launch Hardening + Security Polish)
Current Task: COMPLETE
Current Stage: PHASE GATE
Attempt: -
Tasks Completed: 5/5
Loop Iterations: 5

---

## Task 1: Password Strength Hardening
**Requirement**: Backend Audit: "No password strength requirements beyond 6 characters. Consider checking against common passwords list before launch."
**Accept when**: Registration rejects passwords shorter than 8 chars, rejects common passwords (top ~60), requires at least one letter and one number. Error messages are specific.
**Depends on**: none
**Size**: S
**Primary role**: BACKEND / SECURITY
**Status**: PASS

## Task 2: Auth Edge Case Hardening
**Requirement**: Backend Audit: "SUCCESS_URL and CANCEL_URL are hardcoded to https://razzle.lol" + "import_formulas does one query per formula in a loop"
**Accept when**: Billing URLs use RAZZLE_BASE_URL env var with fallback. import_formulas uses batch inserts (executemany) with pre-fetched existing names.
**Depends on**: none
**Size**: S
**Primary role**: BACKEND / SECURITY
**Status**: PASS

## Task 3: Cache Headers on High-Traffic Read Endpoints
**Requirement**: Backend Audit: "Only two endpoints actually use this cache."
**Accept when**: Already addressed — 120 _cached() calls across all live_data modules + Cache-Control middleware on all GET /api/ endpoints.
**Depends on**: none
**Size**: S (already done)
**Primary role**: BACKEND
**Status**: PASS (pre-existing)

## Task 4: Render Health Check + Environment Documentation
**Requirement**: Backend Audit: "No health check path configured in render.yaml" + "No environment variables defined"
**Accept when**: render.yaml has healthCheckPath, documented env vars in comments. .env.example created with all required env vars.
**Depends on**: none
**Size**: S
**Primary role**: BACKEND
**Status**: PASS

## Task 5: Error Boundary Polish for LLM + Stripe Failures
**Requirement**: North Star: "Loading states have personality" + production resilience for paid features
**Accept when**: LLM timeout/error messages use Razzle personality. Specific error codes (401=bad key, 429=rate limited, 500=provider down). Stripe checkout errors use toast system instead of alert(). "all specialists failed" replaced with personality message.
**Depends on**: none
**Size**: M
**Primary role**: FRONTEND
**Status**: PASS
