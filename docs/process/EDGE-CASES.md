# Razzle Edge Cases — Production Readiness Audit
## 2026-03-14 | Full gstack Shadow Team Review (13 Personas)

Ship Readiness: **52/100** (up from 34/100 on March 13)

---

## TIER 1: SHIP BLOCKERS (Must fix before launch)

### AUTH & ADMIN

| # | Edge Case | What Breaks | File:Line | Persona |
|---|-----------|-------------|-----------|---------|
| 1 | **No admin role exists** | Owner cannot see users, revenue, manage subscriptions, ban abusers, grant press access, or view analytics. Zero admin endpoints. No `is_admin` column. | `backend/auth.py:93` (users table schema) | Reality Checker, Security |
| 2 | **No password reset flow** | User who forgets password is permanently locked out. Zero reset endpoints exist. Will cause chargebacks from paying users. | `backend/auth.py` (no reset functions) | Reality Checker, Sprint Prioritizer |
| 3 | **Client-side tier gating trivially bypassed** | `localStorage.setItem("razzle_user", JSON.stringify({plan:"elite"}))` unlocks: CSV export, all seasons, unlimited formulas/filters, 4-player compare, no ads, full pressure map, multi-season scouting. 11 features gated client-only. | `frontend/app.js:219-230` | Security, Reality Checker |
| 4 | **Welcome modal links to `/agents` (404)** | Every new user who registers and clicks "Enter the Situation Room" gets a 404. Missing `.html` extension. First interaction after signup is broken. | `frontend/app.js:935` | UX Researcher |
| 5 | **Sign In button targets wrong element ID** | Clicking "Sign In" on pricing.html and index.html does nothing. Static button targets `#auth-modal` but modal ID is `authModal`. Race condition with app.js injection. | `frontend/pricing.html:149`, `frontend/index.html:989` | UX Researcher |

### BILLING & STRIPE

| # | Edge Case | What Breaks | File:Line | Persona |
|---|-----------|-------------|-----------|---------|
| 6 | **Stripe never tested with real transactions** | No Stripe test-mode products created, no webhook configured, no real charge processed. The entire money path is untested. | `docs/ROADMAP.md:23` | Sprint Prioritizer |
| 7 | **Payment failure doesn't revoke access** | `_handle_payment_failed` updates subscription status but NOT `users.plan`. Users keep Pro/Elite access indefinitely after card decline. | `backend/billing.py:451-463` | Reality Checker, Security |
| 8 | **Missing `customer.subscription.updated` webhook** | Plan changes through Stripe billing portal silently desync from DB. Downgrades, upgrades, and plan switches are invisible to Razzle. | `backend/billing.py:345-367` | Reality Checker |
| 9 | **No subscription reconciliation job** | If any webhook fails (Render cold start, network issue), user plan is permanently stale. No periodic check against Stripe. | `backend/billing.py` | Security, Backend |
| 10 | **Race condition in early adopter slots** | Two concurrent checkout requests can both pass the limit check and both complete — exceeding advertised limits. No database-level reservation. | `backend/billing.py:239-254` | Backend |
| 11 | **No idempotency check for existing subscriptions** | No check for active subscription before creating new checkout. Risk of double billing. | `backend/billing.py:223` | Reality Checker |

### TIER SPLITTING — COMPLETE MAP

| User State | How It Works | Server Enforced? | Client Enforced? | Edge Cases |
|------------|-------------|-------------------|-------------------|------------|
| **Anonymous** | No token. Gets free Lab. | N/A | N/A | Can explore all free features |
| **Free (registered)** | `users.plan = "free"`, no trial | Server: AI queries (5/day), screener | Client only: CSV, formulas (3 max), filters (3 max), compare (2 max), seasons, ads | **BYPASS**: localStorage manipulation unlocks all client-only gates |
| **Trial (day 1-7)** | `users.plan = "free"` + `trial_end` in future | Server: treated as Pro (20 AI queries) | Client: `trial_active:true` → Pro UI | **GAP**: If tab stays open past day 7, Pro UI persists until refresh |
| **Trial expired (day 8+)** | `users.plan = "free"` + `trial_end` in past | Server: correctly reverts to Free | Client: updates on next `checkAuth()` (page load only) | **GAP**: No expiry modal. Silent demotion. No conversion prompt. |
| **Pro monthly** | `users.plan = "pro"` | Server: 20 AI queries, all endpoints | Client: full Pro UI | Works correctly |
| **Pro yearly** | `users.plan = "pro"` | Same as monthly | Same | Works correctly |
| **Pro lifetime** | `users.plan = "pro_lifetime"` | **BUG**: `QUERY_LIMITS` has no `pro_lifetime` entry → defaults to 5 (free limit) | Client: `isPaidUser()` correctly includes lifetime | **AI queries broken for lifetime users** |
| **Elite monthly** | `users.plan = "elite"` | Server: 999999 AI queries, LLM proxy | Client: full Elite UI | **BUG**: Elite LLM model is `llama-3.1-8b-instruct:free` — same free model as free users |
| **Elite yearly** | `users.plan = "elite"` | Same | Same | Same model bug |
| **Elite lifetime** | `users.plan = "elite_lifetime"` | **BUG**: Same as pro_lifetime — defaults to 5 queries | Client: works | **Double bug**: wrong query limit AND wrong model |
| **Cancelled/downgraded** | Webhook sets `users.plan = "free"` | Server: correct | Client: stale until page refresh | **GAP**: No forced re-auth or plan version check |
| **Payment failed** | Subscription status = `payment_failed` | **BUG**: `users.plan` stays "pro" or "elite" | Client: shows paid UI | **User keeps full access indefinitely** |

### INFRASTRUCTURE

| # | Edge Case | What Breaks | File:Line | Persona |
|---|-----------|-------------|-----------|---------|
| 12 | **Never deployed to production** | Everything is self-assessed in development. razzle.lol has never loaded in a browser. DNS not verified. | `docs/ROADMAP.md:23` | Sprint Prioritizer |
| 13 | **924MB DB on 1GB disk** | Only 76MB free for WAL journal, temp files, users.db growth. Complex queries may use temp storage and fail with SQLITE_FULL. | `render.yaml:28` | Performance |
| 14 | **No error monitoring** | Structured logging to stdout only. No Sentry, no alerts. If app crashes at 3am on Draft Day, nobody knows until a user complains. | No monitoring integration | Sprint Prioritizer |
| 15 | **Rate limiters use proxy IP, not real user IP** | Behind Render's reverse proxy, `request.client.host` is always the proxy IP. All users share one rate limit bucket. Rate limiting is completely non-functional. | `backend/server.py:765,786` | Backend |

---

## TIER 2: HIGH PRIORITY (Fix before Draft Day)

### SECURITY

| # | Edge Case | What Breaks | File:Line | Persona |
|---|-----------|-------------|-----------|---------|
| 16 | **`getAuthToken()` reads from wrong location** | `warroom.js` reads `razzle_user.token` but token is stored in `razzle_token`. Cloud key sync always fails — returns "sign in first" for all users. | `frontend/warroom.js:1482-1487` | Security |
| 17 | **No email verification** | Unlimited trial accounts via fake emails. No way to contact users. Password reset impossible without verified email. | `backend/auth.py` | Reality Checker |
| 18 | **`/api/analytics/summary` is unauthenticated** | Anyone can call this endpoint and see traffic data. Competitors can monitor your growth. | `backend/server.py:2585-2587` | Backend |
| 19 | **LIKE injection in 4 search endpoints** | `prospects.py:48`, `storage.py:252`, `college.py:60`, `college.py:69-75` — user input `%` or `_` not escaped before LIKE. Not SQL injection but allows data enumeration. | Multiple backend files | Backend |
| 20 | **In-memory rate limiters reset on restart** | All 6 rate limiter dicts are in-process memory. Render restart = all limits reset. With 2 workers, limits are per-process (attacker gets 2x). | `backend/server.py:58-141` | Backend, Security |
| 21 | **CORS allows localhost in production** | `http://localhost:8000` and `http://localhost:5173` always allowed regardless of environment. | `backend/server.py:395-400` | Security |
| 22 | **No account lockout per email** | Rate limit is per-IP only. Attacker with multiple IPs can brute-force a specific account's password. | `backend/server.py:784-795` | Security |

### FRONTEND EDGE CASES

| # | Edge Case | What Breaks | File:Line | Persona |
|---|-----------|-------------|-----------|---------|
| 23 | **16+ unprotected JSON.parse(localStorage) calls** | If localStorage is corrupt or tampered, `JSON.parse` throws and kills the page. formula-store.js, warroom.js, league-intel.html have no try/catch. | Multiple files | Frontend Dev |
| 24 | **Virtual scroll renders "undefined" on fast scroll** | `_vscrollRows` is sparse array. Rapid scrolling reads unbuilt indices → literal "undefined" text in table rows. | `frontend/lab.js:1841-1887` | Frontend Dev |
| 25 | **No clipboard fallback in copy functions** | `navigator.clipboard.writeText` fails silently on HTTP/iframes. "Copy URL" button does nothing with no feedback. | `frontend/lab.js:3901-3917` | Frontend Dev |
| 26 | **Warroom animation loop never stops** | rAF loop has visibility pause but if canvas is removed from DOM (navigation), loop runs headless burning CPU. | `frontend/warroom.js:89` | Frontend Dev |
| 27 | **Watchlist cross-tab race condition** | Two tabs open — add player in Tab A while Tab B syncs → Tab B overwrites Tab A's addition on the server. No `storage` event listener. | `frontend/lab.js:230-293` | Frontend Dev |
| 28 | **`signOut()` doesn't clear Sleeper, formulas, watchlist** | Sign out only removes token and user object. Previous user's formulas, recent players, Sleeper username persist. Data leak on shared computers. | `frontend/app.js:699-703` | UX Researcher |

### STRIPE CHECKOUT UX

| # | Edge Case | What Breaks | File:Line | Persona |
|---|-----------|-------------|-----------|---------|
| 29 | **Stripe checkout return: vague loading for 20s** | After payment, polls `/api/auth/me` every 2s x 10 attempts. Single toast "processing..." with no progress indicator. After 20s: "still processing, try refreshing." User just paid and doesn't know if it worked. | `frontend/app.js:484-521` | UX Researcher |
| 30 | **Elite users get free-tier LLM model** | `server.py:1040` — Elite server-side LLM uses `llama-3.1-8b-instruct:free`. Elite users paying $149.99/yr get the same model as free users. | `backend/server.py:1040` | Reality Checker |

### PERFORMANCE

| # | Edge Case | What Breaks | File:Line | Persona |
|---|-----------|-------------|-----------|---------|
| 31 | **esbuild minifies but doesn't bundle** | 7 separate JS files still served as individual requests. ~1MB+ after minify. No code splitting, no lazy loading. | `render.yaml:18` | Performance |
| 32 | **40 threads competing for SQLite** | 2 workers x 20 ThreadPoolExecutor threads = 40 threads hitting SQLite. `busy_timeout=30000` means threads wait up to 30s for locks. | `backend/server.py:379`, `render.yaml:24` | Performance |
| 33 | **`_cache_locks` dict grows unboundedly** | Lock created for every unique cache key but never cleaned up. Memory leak proportional to unique filter combinations. | `backend/live_data/core.py:35,50-51` | Performance |
| 34 | **`users.db` has no connection pool** | Every auth call opens/closes a fresh connection. Under load → `database is locked` errors. | `backend/auth.py:80-87` | Backend |
| 35 | **html2canvas loaded synchronously on 51 pages** | Lazy-load fix only in lab.js. 51 standalone HTML files still have render-blocking 250KB script tag. | 51 standalone HTML files | Sprint Prioritizer |
| 36 | **Formula save endpoint has no plan limit** | Pricing says "Free: 3 formulas." Backend `/api/user/formulas` has no count check. Curl bypasses client limit. | `backend/server.py:1258-1277` | Security, Reality Checker |
| 37 | **Formula store publish has no tier gate** | Pricing says "Publish: Pro/Elite only." Endpoint only checks auth, not plan. Free users can publish via API. | `backend/server.py:1849-1861` | Security |

---

## TIER 3: MEDIUM PRIORITY (Fix in first month)

### UX FLOW GAPS

| # | Edge Case | What Breaks | File:Line |
|---|-----------|-------------|-----------|
| 38 | Trial expiry (day 8) — silent demotion, no modal, no conversion prompt | `app.js:784-794` |
| 39 | Command palette only searches players, not panels/pages (70+ panels undiscoverable) | `app.js:1015-1213` |
| 40 | Footer links to standalone panel pages cause redirect bounce | All 60+ standalone HTML files |
| 41 | Breadcrumbs are plain text, not clickable links | `lab.html:4044` |
| 42 | No `<noscript>` fallback anywhere — blank page if JS fails | All 74 HTML files |
| 43 | Bureau empty state ("no active operations") confusing for offseason users | `league-intel.html:1012` |
| 44 | `openManageSubscription()` uses `alert()` — breaks brand voice | `app.js:857-873` |
| 45 | Shared screener URLs show different data based on recipient's tier (no indicator) | `lab.js:3613` |

### DESIGN CONSISTENCY

| # | Edge Case | What Breaks | File:Line |
|---|-----------|-------------|-----------|
| 46 | `--ink-light` wrong hex (#6d5c4e not #8a7565 per DESIGN.md), ~3.3:1 contrast (needs 4.5:1) | `styles.css:25` |
| 47 | 63+ bare `monospace` canvas font calls (should be `'Space Mono', monospace`) | `lab.js`, `lab-panels.js`, `charts.js`, `warroom.js` |
| 48 | 1px borders persist in 60+ files (DESIGN.md says 2px minimum) | Across standalone panel HTML |
| 49 | 25 instances of Tailwind green/red (#16a34a, #dc2626) instead of CSS variables | Multiple files |
| 50 | Gradient in data bars violates "NO gradients" rule | `lab.js:1792` |

### BRAND VOICE

| # | Edge Case | What Breaks | File:Line |
|---|-----------|-------------|-----------|
| 51 | ~40 hardcoded "could not load X" error messages bypass `razzleError()` | `lab-panels.js` (31), 14 standalone HTML |
| 52 | ~30 hardcoded "no X found" empty states bypass `razzleEmpty()` | `lab-panels.js`, standalone HTML |
| 53 | Zero micro-celebrations (watchlist add, formula save, screenshot, trial start) | `lab.js:198-216`, `app.js:914-947` |
| 54 | Toast messages functional not warm ("CSV exported" vs "tape's in your hands") | `lab.js` (multiple) |
| 55 | "free tier" language in 3 places | `pricing.html:355`, `lab.js:9858`, `warroom.js:2511` |

### ACCESSIBILITY

| # | Edge Case | What Breaks | WCAG |
|---|-----------|-------------|------|
| 56 | Auth form inputs placeholder-only labels (no `<label>` or `aria-label`) | 1.3.1, 3.3.2 |
| 57 | `outline:none` without `:focus-visible` on ~12 elements | 2.4.7 |
| 58 | 19 lab dialogs lack `aria-labelledby` and focus trapping | 4.1.2, 2.4.3 |
| 59 | No `<main>` landmark on any page | 1.3.1 |
| 60 | Dynamic panel content has no `aria-live` regions | 4.1.3 |

---

## TIER 4: LOW PRIORITY (Polish)

| # | Edge Case | File:Line |
|---|-----------|-----------|
| 61 | 404 page has wrong active nav state ("The Lab") | `404.html:140` |
| 62 | about.html missing Sign In button and nav active state | `about.html:185-194` |
| 63 | Sidebar search has no "no results" state | `lab.html:4435-4464` |
| 64 | POS_COLORS defined 3 times (compare.js, player.js, charts.js) | Multiple files |
| 65 | Formula builder: no division-by-zero or NaN protection | `formulas.js:38-96` |
| 66 | CSV export missing UTF-8 BOM for Excel compatibility | `lab.js:36-48` |
| 67 | `confirm()` for delete views blocks UI thread | `lab.js:4087` |
| 68 | Hover card positioning may break with scroll | `lab.js:2120-2133` |
| 69 | `_waitlist_rate` dict grows unbounded | `server.py:1814` |
| 70 | Response cache eviction O(n log n) sort | `server.py:51-53` |
| 71 | SQLite WAL/SHM files not gitignored | `.gitignore` |
| 72 | 10 orphaned process files at repo root | Root directory |
| 73 | `data/terminal_clean.db` is 490MB orphan | `data/terminal_clean.db` |
| 74 | Zero easter eggs beyond Konami code | `app.js:1314-1355` |

---

## WHAT'S ACTUALLY FIXED SINCE MARCH 13 (independently verified)

| Original Issue | Status | Evidence |
|---------------|--------|----------|
| SQLite 64MB cache x 20 pool = OOM | **FIXED** | `db.py:24,37` — pool=5, cache=8MB |
| Render plan unspecified | **FIXED** | `render.yaml:6` — plan: standard |
| Decrypt API key endpoint | **FIXED** | Endpoint removed, comment at `server.py:1232` |
| `setInterval` shadow on pricing | **FIXED** | Grep confirms zero matches |
| `maximum-scale=1.0` zoom disabled | **FIXED** | Removed from all 74 pages |
| CORS `allow_headers=["*"]` | **FIXED** | Now `["Authorization", "Content-Type"]` |
| Sleeper username SSRF | **FIXED** | Strict regex at `server.py:819` |
| JWT secret random on restart | **FIXED** | RuntimeError in production if not set |
| Script tags render-blocking | **FIXED** | All use `defer` now |
| Google Fonts @import | **FIXED** | Changed to `<link>` tags |
| Mobile hamburger menu | **FIXED** | Dynamically injected via `app.js` |
| Auth modal focus trap | **FIXED** | `role="dialog"`, focus trap, Escape |
| Skip-to-content links | **FIXED** | Added to all 74 pages |
| esbuild minification | **FIXED** | In `render.yaml` buildCommand |
| Static asset Cache-Control | **FIXED** | 1yr immutable headers |

---

## OWNER ACTION ITEMS (priority order)

1. **Deploy to production** — Nothing else matters until razzle.lol loads
2. **Set up Stripe test mode** — Create products, configure webhooks, run a test charge
3. **Add admin role** — `is_admin` column, `RAZZLE_ADMIN_EMAIL` env var, `/api/admin/*` endpoints
4. **Build password reset** — Email integration (SendGrid/Resend free tier)
5. **Fix billing webhooks** — Handle `subscription.updated`, `invoice.paid`; revoke on payment failure
6. **Add server-side tier enforcement** — Formula limits, CSV gating, season restrictions
7. **Fix `pro_lifetime`/`elite_lifetime` query limits** — Add to `QUERY_LIMITS` dict
8. **Fix Elite LLM model** — Should use premium model, not free one
9. **Fix `getAuthToken()` in warroom.js** — Read from `razzle_token`, not `razzle_user.token`
10. **Fix welcome modal link** — `/agents` → `/agents.html`
11. **Fix Sign In button IDs** — Use `openAuthModal()` directly
12. **Increase Render disk** — `sizeGB: 2`
13. **Fix rate limiter IP detection** — Use `X-Forwarded-For` header
14. **Add error monitoring** — Sentry free tier
15. **Add `users.db` connection pool**

---

## Methodology

- **Files reviewed**: 117 source files (74 HTML, 11 JS, 2 CSS, 16 Python, config files)
- **Personas run**: 13 (Sprint Prioritizer, UI Designer, UX Architect, UX Researcher, Frontend Developer, Backend Architect, Security Engineer, Performance Benchmarker, Accessibility Auditor, Evidence Collector, Brand Guardian, Whimsy Injector, Reality Checker)
- **Date**: 2026-03-14
- **Review type**: Full edge-case audit (second run — trend comparison vs March 13 baseline)
- **Prior review score**: 34/100
- **Current score**: 52/100
- **Delta**: +18 points (infrastructure fixes resolved, new edge cases found in billing/auth/tiers)
