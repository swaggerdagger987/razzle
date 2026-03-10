# QA + UX Audit — Phases 46-49

**Audit Date**: 2026-03-09
**Scope**: All files changed in Phases 46-49 (QA fixes, home page widgets, bio cards, performance)
**Files Audited**: backend/{auth,server,live_data}.py, adapters/nflverse_adapter.py, frontend/{index,formula-store,lab,warroom,agents}.{html,js}

---

## QA FINDINGS

### CRITICAL-1: XSS in dynamic OG tags — FIXED
**File**: backend/server.py (lab, player, compare OG handlers)
**Issue**: Player names and URL params interpolated into meta tag content without escaping. A name containing `"` could break out of the attribute.
**Fix**: Added `_html.escape(og_title, quote=True)` and `_html.escape(og_desc, quote=True)` before all OG tag substitutions in lab, player profile, and compare handlers.

### CRITICAL-2: Stored XSS in formula review text — FIXED
**File**: frontend/formula-store.js:503
**Issue**: `existingUserReview.text` inserted into innerHTML without escaping while adjacent fields used `escapeHtml()`.
**Fix**: Wrapped in `escapeHtml(existingUserReview.text)`.

### HIGH-1: User enumeration via login errors — FIXED
**File**: backend/auth.py:146-152
**Issue**: Different error messages for "user not found" (404) vs "invalid password" (401).
**Fix**: Both now return `"Invalid email or password"` with 401 status.

### HIGH-2: Rate limiter memory leak — FIXED
**File**: backend/server.py:27-41
**Issue**: `_rate_buckets` dict grows without bound from unique IPs that never return.
**Fix**: Added `_RATE_MAX_IPS = 10000` cap. When exceeded, stale entries (older than window) are pruned.

### HIGH-3: Unauthenticated formula rating — DEFERRED
**File**: backend/server.py:607
**Issue**: POST /api/formulas/{id}/rate has no auth check. Vote stuffing possible.
**Note**: Low impact pre-launch. Will address when auth is required for community features.

### MEDIUM-1: Position not escaped in featured cards — FIXED
**File**: frontend/index.html:1085,1103,1121
**Issue**: `p.position` interpolated without `escapeHtml()` in featured card rows.
**Fix**: All three instances now use `escapeHtml(p.position)`.

### MEDIUM-2: No input length validation on formula publishing — DEFERRED
**Issue**: Name, description, creator_name have no max length.
**Note**: Low risk pre-launch. Will add validation when community features go live.

### MEDIUM-3: _cached() has no max size — ACCEPTED
**Issue**: Cache dict is unbounded. Only 2 keys currently used.
**Note**: Acceptable for current usage. The function is only called for filter_options and featured.

---

## UX FINDINGS

### HIGH-1: Shuffle button nearly invisible — FIXED
**File**: frontend/index.html:827
**Issue**: Ghost button with `color:var(--ink-light)` on dark bg at 11px — nearly invisible.
**Fix**: Changed to `color:var(--yellow)`, `border-color:var(--yellow)`, `font-size:13px`.

### HIGH-2: Demo section accessibility — FIXED
**File**: frontend/index.html:824
**Issue**: No aria-live region on demo cards. Screen readers not notified on shuffle.
**Fix**: Added `aria-live="polite"` to `#demoCards` container.

### HIGH-3: Featured cards buried below static content — DEFERRED
**Issue**: Featured cards (live data) sit below static marketing sections.
**Note**: Home page layout is a product decision. Current order (hero → features → mascot → live data → bios → demo → pricing) builds progressively. Will evaluate after Reddit launch metrics.

### HIGH-4: Pricing button dead-end — ACCEPTED
**Issue**: "Get Started" falls back to /agents.html if startCheckout not defined.
**Note**: Stripe checkout IS wired (Phase 43). The fallback only triggers if billing.js fails to load.

### MEDIUM-1 through MEDIUM-10: Various UX polish items — DEFERRED
**Note**: Featured card link styling, toast mobile text, API key UX, pricing card mobile width, config panel mobile positioning. All logged for future polish phases.

---

## Summary

| Severity | Found | Fixed | Deferred |
|----------|-------|-------|----------|
| CRITICAL | 2 | 2 | 0 |
| HIGH | 3 QA + 4 UX | 4 | 3 |
| MEDIUM | 3 QA + 10 UX | 1 | 12 |
| LOW | 3 QA + 6 UX | 0 | 9 |
