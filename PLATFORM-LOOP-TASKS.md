# Platform Loop — Phase 158 Task List

## Status
Current Phase: 158 (Security Headers + BYOK Server-Side Storage + Production Hardening)
Current Task: COMPLETE
Current Stage: COMPLETE
Attempt: 1/3
Tasks Completed: 5/5
Loop Iterations: 5

---

## Phase Rationale

All Roadmap phases 0-9 are complete (157 phases shipped). The product has auth, billing, Stripe, agents, pixel canvas, tier gating, and the full Lab. Before launch, the system prompt mandates: "BYOK keys encrypted at rest, never logged" and "Every input is malicious. Every secret leaks. Every webhook is spoofed." Currently BYOK keys were stored only in browser localStorage (not encrypted, not server-side). Additionally, no HTTP security headers (CSP, HSTS, X-Frame-Options) were set, and the render.yaml lacked full env var documentation.

---

## Task 1: HTTP Security Headers Middleware
**Requirement**: "Every input is malicious. Every secret leaks." — Security Engineer role mandate.
**Accept when**: Security headers on every response.
**Depends on**: none
**Size**: M
**Primary role**: SECURITY
**Status**: PASS — 8 security headers verified on API responses (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Strict-Transport-Security, Permissions-Policy, Content-Security-Policy, X-Request-ID)

## Task 2: BYOK API Key Server-Side Encrypted Storage
**Requirement**: "BYOK keys encrypted at rest, never logged, never include in error messages"
**Accept when**: Encrypted key CRUD works end-to-end.
**Depends on**: none
**Size**: L
**Primary role**: SECURITY / BACKEND
**Status**: PASS — Fernet encryption, 4 endpoints (GET/POST/GET-decrypt/DELETE), roundtrip verified, invalid provider rejected, too-short key rejected, unauthenticated access rejected, Pro+ tier gating enforced

## Task 3: Render Production Configuration
**Requirement**: Backend Audit: render.yaml should document required env vars and have health check.
**Accept when**: render.yaml complete with all env vars documented.
**Depends on**: none
**Size**: S
**Primary role**: BACKEND
**Status**: PASS — healthCheckPath, numInstances, autoDeploy, ENCRYPTION_KEY, RAZZLE_LLM_* vars, all promotional pricing vars documented

## Task 4: Rate Limiting Hardening
**Requirement**: "Rate limiter prevents brute force"
**Accept when**: Billing + BYOK endpoints rate limited, Retry-After headers present.
**Depends on**: Task 1
**Size**: S
**Primary role**: SECURITY
**Status**: PASS — _check_sensitive_rate (5/60s) on billing checkout and BYOK save. Retry-After headers on all 429 responses (auth: 60s, sensitive: 60s, daily quota: 3600s).

## Task 5: QA + Security Verification
**Requirement**: All security changes verified end-to-end.
**Accept when**: Server starts, all headers present, BYOK works, rate limits fire.
**Depends on**: Tasks 1-4
**Size**: S
**Primary role**: QA
**Status**: PASS — Server imports OK, 8 security headers on all responses, BYOK CRUD verified (save/list/decrypt/delete), encryption roundtrip confirmed, auth rejection on unauthenticated requests, rate limiting fires at threshold, Retry-After headers present, no secrets in error responses, all Python files compile clean, all 5 main HTML pages serve 200.
