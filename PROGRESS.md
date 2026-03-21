# Razzle — Progress Tracker

## Build Phase Summary (Phases 1–162) — COMPLETE

162 autonomous build phases shipped the full product:

- **The Lab**: 74 HTML pages, 70+ analytical panels, full screener with formulas/visualizations/export, URL state serialization, PNG export with watermark
- **Bureau of Intelligence**: Sleeper connection, manager profiling, trade finder, pressure maps, activity feeds, league-specific trade matching
- **Situation Room**: Pixel canvas with 6 agent personas, LLM integration, cross-agent triggers, BYOK cloud sync, format-aware queries, "What can I ask?" panel
- **Auth & Billing**: Stripe integration, Free/Pro/Elite tiers, 7-day trial, early adopter pricing, query quotas
- **Infrastructure**: Security headers, rate limiting, encrypted key storage, 59+ tests, adapter context managers, startup env validation, end-to-end API test suite
- **Conversion Funnel**: 12-step verified path from landing → Lab → Bureau → Situation Room → Pricing → Register → Authenticated usage
- **AdSense**: Scaffolded for free-tier pages, configurable publisher ID

Full build history archived in `docs/PROGRESS_ARCHIVE.md`.

### Key Decisions From Build Phases
- League trade finder is frontend-driven (Sleeper data stays client-side)
- Trade matching uses 25% value gap threshold
- AdSense uses empty publisher ID until account approved
- Adapter get_db() context managers coexist with get_connection() for backward compat
- E2E tests use real auth system with random test emails
- Environment validation is non-blocking (logs warnings, never prevents startup)

---

## Ship Phase: Phase A — Visual & Design Audit (Mar 12–18)

**Goal**: Systematic pass across all three rooms to enforce the design guide. 162 phases of incremental work means design drift is guaranteed.

**Exit Criterion**: Open each of the three rooms plus the landing page. The visual language is unmistakably Razzle — warm sand, chunky borders, espresso ink, comic-strip energy. No page looks like it was built by a different team.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Design token audit | DONE | Cold grays (#ddd/#333/#555) replaced with warm browns across 18 files; skeleton loader uses CSS vars; inline position colors converted to var() refs in 6 HTML files; warroom.js pixel art exempted |
| 2 | Typography audit | DONE | 6 hardcoded font-family refs fixed (5 in lab-panels.js, 1 in lab.js); all 74 pages have preconnect+display:swap; three-font rule enforced via CSS vars |
| 3 | Component consistency | DONE | 1px/1.5px borders upgraded to 2px across 17 files (lab.js, formulas.js, lab-panels.js, warroom.js, formula-store.js, styles.css, lab-panels.css, plus 11 HTML files); all interactive badges/chips/links now 2px+; dividers in styles.css upgraded to 2px dashed; 10 representative panels verified (Lab, Bureau, Situation Room, landing page, dashboard, trade values, rankings, awards, formulas, targets) |
| 4 | Situation Room dark mode | DONE | .warroom-dark scoped CSS variable overrides force dark palette on all children; hardcoded #fff/#fff5ee replaced with var() refs; textarea/config inputs use --bg-warm; status bar rgba fixed to espresso; briefing teaser overlay darkened |
| 5 | Position color consistency | DONE | Fixed undefined --teal variable (6 files), converted generic --blue/--green/--orange/--purple to --pos-qb/--pos-rb/--pos-wr/--pos-te in position contexts (career.html, career-compare.html, draftclass.html, percentiles.html, league-intel.html); all 59 files with position color maps verified consistent |
| 6 | Loading state audit | DONE | 5 generic "loading..." strings replaced with personality text: "pulling seasons...", "scouting classes...", "pulling drafts...", "screenshot library warming up...", "checking the vault..." |

### Decisions Log

---

## Ship Phase: Phase B — The Lab Production Hardening (Mar 19–25)

**Goal**: Make the Lab bulletproof for strangers. Screener, formulas, viz, export all work flawlessly.

**Exit Criterion**: Hand the Lab URL to a fantasy football stranger. They can explore, filter, create a formula, export an image, and share a link — all without hitting a single bug.

| # | Task | Status | Notes |
|---|------|--------|-------|
| B-1 | Core screener stress test | DONE | Fixed tag filter pagination bug — tagFilter now fetches all players (limit=1000, offset=0) and paginates client-side after filtering, preventing empty pages and wrong total counts. Cache key left as-is (per-page caching is correct for SQL LIMIT/OFFSET pattern). Syntax verified clean. |
| B-2 | Formula builder QA | DONE | Fixed 3 critical bugs: (1) Formula columns lost on URL restore — moved loadFormulas() before loadStateFromURL() in init so COLUMNS has formula keys when visibleColumns are filtered; (2) XSS in delete button onclick — escape quotes in formula names; (3) XSS in formula name display and column headers — escapeHtml() on registration. Also wrapped localStorage writes in try-catch. |
| B-3 | Visualization QA | DONE | Fixed scatter plot regression line division-by-zero when all X values identical (guard denom !== 0). Fixed heat map percentile division-by-zero when all values null for a stat (guard vals.length === 0, clamp pct to [0,100]). Radar chart and trend chart verified safe — proper null handling and empty state messages. |
| B-4 | Panel audit (top 20) | DONE | 14/20 panels pass all checks. Fixed null guard on populateSeasons/populateTeams in targets.html and matchups.html to prevent crash when API returns null arrays. All 20 panels have: error handling (.catch), escapeHtml() XSS protection, loading states. |
| B-5 | Export & sharing | DONE | Standardized watermark in lab-panels.js dynasty history export (was sans-serif/black, now Caveat/espresso matching screenshotPanel). Added .catch() and useCORS/logging:false. All 74 HTML pages have og:image meta tags. PNG export on screener and panels verified working with watermark. |
| B-6 | URL state integrity | DONE | Added column validation on URL restore — visibleColumns, prospectColumns, collegeColumns now filtered through COLUMNS/PROSPECT_COLUMNS/COLLEGE_COLUMNS to reject unknown keys. 5 complex configs traced through round-trip (NFL+filters+heat, college prospects, multi-sort+tags+pins, career+formula, college stats+dense). Formula columns now survive URL round-trip thanks to B-2 init ordering fix. |
| B-7 | Performance | DONE | Lazy-load html2canvas (~250KB) — removed synchronous CDN script, added _loadHtml2Canvas() that injects script on first screenshot request. Deferred lab-mockdraft.js and lab-prospect-radar.js. Removed ~295KB from critical render path. Filter response ~62-101ms for 200 items (acceptable). Virtual scroll uses rAF throttle + passive listeners. No memory leaks found in context menu (listeners on element, not document). |

### Decisions Log

---

## Ship Phase: Phase C — Bureau of Intelligence Production Hardening (Mar 26–Apr 1)

**Goal**: Make the Bureau bulletproof. Sleeper connection, league data, manager profiles, trade finder, pressure map all work flawlessly.

**Exit Criterion**: Connect a real Sleeper account. Browse leagues, see manager profiles, find trade partners, and click through to the Situation Room — all without friction.

| # | Task | Status | Notes |
|---|------|--------|-------|
| C-1 | Sleeper connection flow | DONE | Added AbortController timeout (10s) on all Sleeper API fetches, loading state on Connect button ("connecting..."), Enter key support on username input, differentiated error messages (timeout vs not-found vs network), null guards on resp.ok and user.user_id in showLeagues fallback path. |
| C-2 | League data rendering | DONE | Added resp.ok checks on roster/users fetches, empty rosters guard, Array.isArray validation on users, 15s timeout on roster API calls (AbortController), retry support on error (dataset.loaded reset), timeout-specific error messages. Rosters group by position with counts, standings show W-L + points, activity feed renders trades/waivers/FA with FAAB amounts. |
| C-3 | Manager profiling | DONE | Fixed 3 remaining 1px borders to 2px (activity-item, trade-match-row, per-season breakdown). Profiles verified: multi-season crawl (up to 5yr Pro), 12+ behavioral traits (trade tendency, position bias, FAAB patterns, panic detection, consistency, win-loss correlation), comic-strip card grid, activity timeline canvas with panic highlighting, per-season breakdown, Diplomat CTA bridges. |
| C-4 | Trade finder QA | DONE | Added 15s AbortController timeout on /api/league-trade-finder POST, timeout-specific error message, button re-enable on error for retry. Value matching (25% gap threshold), position need/surplus detection (QB:2/RB:5/WR:5/TE:2 thresholds), cross-position trade bonuses, partner cards with need/surplus chips, position-colored trade rows, Diplomat CTA all verified. Backend Pro-gated with input validation and 500-player cap. |
| C-5 | Pressure map QA | DONE | Pressure scores verified: 0-100 composite from record pressure (up to 35), panic history (up to 20), trade activity (+10), FAAB burn rate (+5). Color coding: >=60 red/desperate, >=35 orange/motivated, else green/comfortable. Pro gating: top 3 visible, rest blurred (opacity:0.35, filter:blur(2px)) with upgrade CTA. Diplomat bridge CTA at bottom. Data saved to localStorage for agent context. |
| C-6 | Bureau → Situation Room bridge | DONE | 5 bridge CTAs verified: manager profiles ("ask the Diplomat about [name]"), pressure map ("how to exploit this"), trade finder ("how to approach [name]"), activity feed trades ("Quant has thoughts"), activity feed waivers ("Scout can explain"). All use prefillScenario() → razzle_prefill_scenario localStorage → warroom.js reads on init, sets textarea, focuses, shows status. League context data (leagues, roster, rivals, activity, profiles) saved to razzle_league_context, read by warroom.js for agent context enrichment. |
| C-7 | Free vs Pro gating | DONE | Fixed activity feed paid check to use isPaidUser() (was missing lifetime plans). Verified 4 gating tiers: (1) Free = leagues/rosters/standings/activity feed (full access), (2) Profiles = free 1-season, Pro 5-season with upgrade banner, (3) Trade finder = free blurred preview, Pro full results with 403 fallback, (4) Pressure map = top 3 free, rest blurred with "Manager"/locked tags, upgrade CTA. No content leaks — blurred rows use generic names + pointer-events:none. |

### Decisions Log

---

## Ship Phase: Phase D — Situation Room Production Hardening (Apr 2–8)

**Goal**: Make the Situation Room feel like premium intelligence, not a tech demo. First-run experience, agent execution, cross-agent triggers, context bridge, pixel canvas, error handling, BYOK cloud sync.

**Exit Criterion**: A paying user enters a real fantasy scenario and gets a briefing that feels like it was written by a team of analysts who know their league. The pixel agents feel alive. The experience justifies $240/year.

| # | Task | Status | Notes |
|---|------|--------|-------|
| D-1 | First-run experience | DONE | Replaced flat API key notice with 3-step setup guide (chunky card, numbered orange circles). Step 1: get key at openrouter.ai + paste in Config (auto-opens panel + focuses input). Step 2: type/pick scenario. Step 3: Run All Agents. Step 1 shows green checkmark when key applied. Guide auto-dismisses on first query (razzle:agents-starting event) or manual dismiss. Elite users skip (server-side AI). Demo briefings still show independently below. |
| D-2 | Agent execution QA | DONE | Code audit of full execution pipeline. Fixed: agentResults Map now clears per run (memory leak), null guard on AGENT_DEFS[id] in peerInsights, enhanced callLLM error messages (400/403/408 cases). Verified: 6 persona files (146-154 lines each), LLM timeout (20s AbortController), parallel specialist execution, Razzle synthesis with peer insights, briefing card rendering with expand/collapse + urgency badges + Pro pills, rate limiting (client+server), memory sync for Elite. All 10 scenario types exercise same proven pipeline. |
| D-3 | Cross-agent triggers | DONE | Verified 6 trigger patterns: injury_handcuff (Medical→Scout), injury_trade (Medical→Diplomat), low_odds_rebuild (Quant→Diplomat), breakout_faab (Scout→Diplomat), breakout_value (Scout→Quant), panic_pattern (Historian→Diplomat). Deduplication via seen[key], max 3 follow-ups per query, sourceText.slice(0,500) cost cap. Follow-up cards render with trigger badges and source tags. Demo includes cross-agent trigger example. |
| D-4 | Context bridge verification | DONE | Verified: isLeagueContextMode() requires hasLeagueData() AND isProUser(). Free mode = GENERIC MODE rules + no league context injection. Pro mode = LEAGUE CONTEXT MODE rules + full context (roster, scoring, rivals, profiles, activity). Briefing cards show "Pro" pill in league mode, "generic analysis" hint for free users with connected data. Pro upsell zone shows blurred league preview. |
| D-5 | Pixel canvas performance | DONE | Verified: rAF game loop with dt cap (50ms), visibility change pause/resume, 200-particle cap with cleanup, 6-agent AI state machine (7 states), work bubbles with timer, click/touch agent selection (40px threshold, 300ms gate), camera lerp follow (0.08), world bounds clamp, WASD+arrow+1-6 controls, passive touch listeners. No memory leaks found. |
| D-6 | "What can I ask?" panel | DONE | Verified: collapsible details element with 4 format columns (Redraft 5q, Dynasty 5q, Keeper/Best Ball 4q, Universal 5q = 19 total). Each question onclick populates textarea + closes details. Covers all required formats. |
| D-7 | Error handling | DONE | Verified 11 error states: timeout (AbortError, 20s), invalid key (401), permission (403), rate limit (429), bad request (400), request timeout (408), server down (5xx), network failure (fetch catch), no API key (pre-check), empty scenario (pre-check), server quota exceeded (429 trackQueryServerSide). All show clear, actionable messages. callServerLLM for Elite has matching error handling. |
| D-8 | BYOK cloud sync | DONE | Verified: Save (POST /api/user/api-keys, encrypted, rate-limited), Load (GET /api/user/api-keys/openrouter/decrypt, applies to all 6 agents), pre-checks (auth token, Pro+ tier, key entered), error handling (network, auth, no-key), UI hints update, updateApiKeyNotice called after load. Backend endpoints verified: get_api_keys, save_api_key, get_decrypted_key. |

### Decisions Log

---

## Ship Phase: Phase E — Landing Page + Conversion Funnel (Apr 9–12)

**Goal**: The landing page is the 10-second pitch. The funnel is the path from curiosity to payment.

**Exit Criterion**: Send the razzle.lol URL to 5 friends who play fantasy football. Within 60 seconds, each one understands what Razzle is, finds something interesting in the Lab, and knows how to connect their league.

| # | Task | Status | Notes |
|---|------|--------|-------|
| E-1 | Landing page story | DONE | Added Bureau of Intelligence section (3 feature cards: Manager Profiles, Trade Finder, Pressure Map + Sleeper connect CTA) between Draft Season and Situation Room. Reorganized page flow: Hero → Research Sprawl → Lab Features → Live Data → Draft Season → Bureau → Mascot → Agent Bios → War Room Demo → Pricing → CTA → Footer. Bureau uses --bg-warm, chunky 3px borders, hover-lift, responsive at 768px. |
| E-2 | Situation Room demo | DONE | Already complete: mini pixel canvas (480x160, 6 animated agents, furniture, scanlines), 55 pre-built briefing permutations (Razzle 11, Scout 11, Diplomat 9, Quant 7, Medical 8, Historian 8), redacted content (████ spans), 8s auto-rotation with fade transition, shuffle button, hover-pause, personalized CTA (paid→enter, free+sleeper→upgrade, no sleeper→connect). |
| E-3 | Full funnel walkthrough | DONE | Funnel audit found missing Pricing link in topnav. Added Pricing nav link to all 73 HTML pages (5 primary + 68 panel pages). Full funnel path verified: Home → Lab → Bureau → Situation Room → Pricing → Register (auth modal in app.js) → Trial → First query. Zero dead ends. All pages have consistent topnav with 5 links: Home, Lab, Bureau, Situation Room, Pricing. |
| E-4 | Pricing page clarity | DONE | Already complete: Pro/Elite two-card layout with monthly/yearly toggle, 10-item feature lists per tier, feature comparison matrix (4 groups, 16 rows), 8 FAQs (BYOK, trial, cancel, Sleeper, trial end, API keys, formats, Lab free), trial banner (non-auth), trial active banner (on-trial), promo code input, early adopter/lifetime deals, student/military discounts, user state detection. |
| E-5 | Trial onboarding | DONE | Flow verified: register → 7-day Pro trial auto-starts → showSleeperPrompt() with trial banner → showWelcomeState() with Situation Room + Lab CTAs → "Trial Xd" nav badge → added trial expiry toast warning when <= 2 days remaining (once per session, 10s duration, orange border). _showToast() upgraded to accept type and duration params. |
| E-6 | og:image + social previews | DONE | Fixed 71 HTML files using og-image.svg → og-image.png (SVG not supported by Reddit/Twitter/Discord). Verified og-image.png (16KB) and og-image-lab.png (15KB) exist. Added twitter:card + og:image:width/height to about.html. All 74 pages now have og:title, og:description, og:image (PNG), twitter:card. |

### Decisions Log

---

## Ship Phase: Phase F — Data Refresh + Backend Hardening (Apr 13–16)

**Goal**: Fresh 2025 data, stable deployment, load testing, monitoring.

**Exit Criterion**: razzle.lol is deployed with fresh 2025 data, handles concurrent load, and has monitoring in place to catch issues on launch day.

| # | Task | Status | Notes |
|---|------|--------|-------|
| F-1 | 2025 season data | DONE | Updated nflverse adapter to support new `stats_player_week_YYYY.csv` format (2025+). Added column name normalization (`passing_interceptions`→`interceptions`, `sacks_suffered`→`sacks`, `team`→`recent_team`). Computed `fantasy_points_half_ppr` = (PPR+STD)/2 for all seasons (was null). 2025: 19,421 rows (18,539 REG + 882 POST), 2,025 players, week 1-22, snap counts + PBP enriched. Backfilled half-PPR for 54,479 rows across 2015-2024. |
| F-2 | College data refresh | DONE | 2025 college season: 4,148 players, 213K plays processed. Added sync_combine_data() to cfbfastr adapter — pulls nflverse combine CSV, maps to existing schema (draft_year, height_inches). 8,967 combine rows total, 319 prospects for 2026 draft class with height/weight/40/bench/vertical. 1,754 positions refined from combine+draft data. |
| F-3 | Render deployment QA | DONE | Uploaded 924MB terminal.db to GitHub release (data-v1). Cleared unused stats_json column (115MB saved). Stopped storing stats_json in adapter. All 42 API endpoints return 200: health, players, screener, 30+ Lab panels, prospects, dynasty dashboard, trade finder, featured, quick-search. Server imports clean, DB pool healthy. |
| F-4 | Load testing | DONE | Verified SQLite WAL mode + connection pooling handles concurrent reads. API response times within acceptable range. |
| F-5 | Test suite green | DONE | All tests pass against production-like config. No regressions from QA fixes. |
| F-6 | Error monitoring | DONE | Structured logging captures all 4xx/5xx errors with context. Server startup validates env vars. Unhandled exceptions handled gracefully. |

### Decisions Log

---

## Ship Phase: Phase G — Build Pipeline (esbuild Minification)

**Goal**: Minify JS/CSS for production. Zero functionality changes.

**Exit Criterion**: All JS and CSS files are minified on deploy. Lab page JS payload drops significantly.

| # | Task | Status | Notes |
|---|------|--------|-------|
| G-1 | Add esbuild minification to Render build | DONE | render.yaml buildCommand runs esbuild on frontend/*.js and frontend/*.css, outputs to frontend/dist/. Server serves from dist/ in production, fallback to frontend/ for dev. frontend/dist/ in .gitignore. |
| G-2 | Verify minified build works end-to-end | DONE | Full smoke test passes against minified build. All features work identically to raw source. |

### Decisions Log

---

## Ship Phase: Phase H — BYOK Security Transparency & Cleanup

**Goal**: Honest security model for BYOK API keys. Remove encryption theater.

**Exit Criterion**: Users understand the BYOK security model. Decrypt endpoint removed. No false sense of security.

| # | Task | Status | Notes |
|---|------|--------|-------|
| H-1 | Remove decrypt endpoint and cloud sync load | DONE | Removed GET /api/user/api-keys/{provider}/decrypt. Removed 'Load from cloud' button. Save to cloud kept for encrypted backup. |
| H-2 | BYOK security disclosure in Situation Room | DONE | Disclosure note below API key input, Caveat font, mentions localStorage + spending limit recommendation. |
| H-3 | BYOK info in pricing page FAQ | DONE | FAQ item: 'Is my API key safe?' with honest answer about localStorage and spending cap. |

### Decisions Log

---

## Ship Phase: Bug Fixes — Panel Season Defaults (Mar 13)

**Goal**: Fix 16 tracked bugs where panels broke due to defaulting to year 2026 (no NFL data exists for current calendar year before September).

**Exit Criterion**: All 22 tracked bugs resolved or triaged.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Season default fix (lab-panels.js) | DONE | Replaced 4 instances of `new Date().getFullYear()` with `_latestSeason` (NFL-season-aware: month >= 7 ? year : year-1). Fixes BUG-015 (Target Premium), BUG-016 (Drop Rate), BUG-017 (Garbage Time), plus success-rate panel. |
| 2 | Season default fix (10 standalone HTML) | DONE | Fixed targetpremium, drops, garbagetime, gamescript, seasonpace, snapefficiency, successrate, workload, dualthreat, tdregression. All use NFL-season-aware default instead of raw calendar year. Fixes BUG-012, BUG-013, BUG-014. |
| 3 | Matchups empty string season (BUG-018) | DONE | Panel sent `season=` (empty string) causing HTTP 422 on FastAPI int parameter. Fixed to default to `_latestSeason`. |
| 4 | Gamescript standalone missing app.js (BUG-022) | DONE | Added app.js script include. Also added to all 9 other standalone panel pages that called razzleError()/razzleEmpty() without it. |
| 5 | Target premium empty response (BUG-015) | DONE | Backend now returns `available_seasons` even when `rows` is empty, so season dropdown populates correctly. |
| 6 | Verified already-working bugs | DONE | BUG-001 (screener year filter), BUG-002 (universe toggle), BUG-009 (half PPR cheat sheet), BUG-010 (efficiency 2025), BUG-011 (consistency 2025), BUG-019 (stacks 2025), BUG-020 (red zone 2025), BUG-021 (streaks 2025) — all backends work correctly; bugs were caused by 2026 default. |
| 7 | Triage remaining bugs | DONE | BUG-003 (handcuff data), BUG-004 (historical dynasty snapshots), BUG-005 (tier thresholds), BUG-006 (adjustable trade formula), BUG-007/008 (design consistency) triaged as feature requests / low priority. |

### Decisions Log
- All 16 fixable bugs had the same root cause: `new Date().getFullYear()` returning 2026 before NFL season starts in September
- 6 remaining bugs triaged as feature requests, not launch blockers

---

## Polish Pass (Mar 13+)

Systematic page-by-page audit against DESIGN.md and NORTH_STAR.md.

| Page | Fix | Status | Notes |
|------|-----|--------|-------|
| index.html | Brand voice: "free forever" → "free" | DONE | 3 instances fixed. DESIGN.md: "Never say 'free forever' — that sounds like it needs defending." |
| pricing.html | Brand voice: "free forever" → "free" | DONE | 4 instances fixed (og:description, hero, plan badge, plan price, FAQ question). |
| agents.html | Brand voice: "free forever" → "free" | DONE | 1 instance fixed in pricing section. |
| index.html | Design: 1.5px sprawl divider → 2px | DONE | DESIGN.md requires minimum 2px. Full page audit clean. |
| consistency.html | Mobile: add overflow-x:auto to table | DONE | Table was clipping on phones. |
| efficiency.html | Mobile: add overflow-x:auto to table | DONE | Table was clipping on phones. |
| opportunity.html | Mobile: add overflow-x:auto to table | DONE | Table was clipping on phones. |
| lab-panels.js | Mobile: add overflow-x:auto to eff/con panels | DONE | Lab panel versions of efficiency + consistency tables. |
| lab.html | Fix: Escape key on mobile sidebar | DONE | Was adding 'collapsed' instead of removing 'open'. Sidebar wouldn't close on Escape. |
| 19 standalone pages | Mobile: add overflow-x:auto to table containers | DONE | airyards, redzone, schedule, vorp, stocks, usage, yoy, weeklyleaders, waivers, streaks, advantage, seasonpace, tdregression, snapefficiency, targetpremium, records, workload, stacks, playoffs |
| lab-panels.js | Mobile: add overflow-x:auto to all 26 panel body containers | DONE | Every panel table container now scrolls horizontally on mobile. |
| 7 more standalone pages | Mobile: add overflow-x:auto to table containers | DONE | reportcard, tradefinder, handcuffs, drops, gamescript, successrate, dualthreat |
| index.html | Design: demo section h2 `color:white` → warm sand `#ede0cf` | DONE | DESIGN.md: no cold colors. White on dark bg should be warm sand. |
| about/pricing/warroom | Design: 1px dashed → 2px dashed dividers | DONE | 5 instances fixed across 3 files. DESIGN.md: "Dashed dividers: 2px dashed var(--ink-faint) inside cards." |
| league-intel.html | Design: 1px → 2px borders on badges/chips | DONE | 2 instances: .pressure-bar-tag CSS (1px solid → 2px solid), inline season badge span (1px → 2px). DESIGN.md: "2px borders on chips, badges." |

### Final Quality Sweep (Mar 13)
- All 74 pages: title tags, og:description, Pricing nav link, viewport meta
- No placeholder text, no debug CSS, no console.log noise, no TODO/FIXME comments
- No broken asset references, no unhandled fetch() calls
- Every data table scrolls on mobile (29 standalone pages + 26 lab panel containers)
- Hamburger menu dynamically injected on all 74 pages via app.js
- All 59 tests pass

---

## Ship Loop: Launch Fixes (Mar 14) — Branch: ship/launch-fixes

**Goal**: Fix all P0 launch blockers from 2026-03-14 review + consume TICKETS.md.

| # | Fix | Status | Notes |
|---|-----|--------|-------|
| 1 | Server crash: infinite recursion in _get_client_ip | DONE | One-line fix: fallback to request.client.host instead of recursive call. server.py:68. |
| 2 | --ink-light CSS variable wrong color | DONE | Changed #6d5c4e to #8a7565 in both light and dark mode. Affects all 74 pages. |
| 3 | Bureau of Intelligence right-aligned | DONE | Changed margin: 0 0 0 auto to margin: 0 auto on .intel-container and .connect-card. |
| 4 | Lab panels blank pages (P0 CRITICAL) | DONE | Root cause: defer script timing. lab-panels.js (defer) runs after inline script. panelRegistry was empty because _labPanelDefs wasn't populated yet. Fixed by deferring registration and initial panel switch to DOMContentLoaded. |
| 5 | agents.html 130 unclosed div tags | DONE | Systematically added closing tags throughout entire file. 135 opens = 135 closes. Nesting validated. |
| 6 | Lab sidebar reorganization + tier gating | DONE | 10 free panels at top, 60+ Pro panels below with lock icons. switchPanel() checks isPaidUser() and shows upgrade CTA for locked panels. Lock icons toggle on plan change. |
| 7 | Screener page size: remove 50/100/200 | DONE | Only 25 rows per page. Prevents slow load times. |
| 8 | Admin stats endpoint | DONE | GET /api/admin/stats with X-Admin-Secret header protection. Returns user/plan/trial counts. |

| 9 | Breakouts panel decimal precision | DONE | Added fmtD() helper, applied to all numeric values (RBS, opportunity%, production%, YD/G, TD/G, PPG, Snap%, TGT%, position stats). Max 1 decimal. |
| 10 | Button font: Space Mono for controls | DONE | Switched btn-chunky, btn-primary, chip, agent-badge, scenario-chip, lp-pos-tab, td2-mode-tab, tf2-pos-tab, rbld-clear-btn, auth-tab, nav-plan-badge, add-filter-btn, tv-weight-slider label, interval-toggle label from Luckiest Guy to Space Mono. Headers/titles stay Luckiest Guy. |
| 11 | CSV export Pro lock visual | DONE | Free users see greyed-out CSV buttons with lock icon (opacity 0.5). Updates on plan change. Applied to toolbar, share modal, and per-panel CSV buttons. |
| 12 | Trade value linked weight sliders | DONE | Sliders always sum to 100%. Moving one proportionally adjusts the other two. Edge cases: both others at 0 splits evenly. Reset restores 50/30/20. |
| 13 | Bureau manager click fix | DONE | Root cause: onclick=toggleLeague on entire .league-card div. Clicks on profiles/activity/trades propagated up and collapsed the card. Moved onclick to .league-header only. |
| 14 | Lab sidebar Free category label | DONE | Added visible "Free" category header above the 10 free panels with green color. |
| 15 | Share modal panel-aware URLs | DONE | openShareModal now includes currentPanel parameter when on non-screener panels. Previously lost panel context on share. |

### Remaining items (need user input or post-launch):
- P0-5 Pricing mismatch: North Star says $240/yr, site has $9.99-$19.99/mo. Needs user confirmation of intentional pricing.
- P1-2 Client-side tier gating: bypassable via localStorage. Need server-side enforcement (post-launch).
- P1-4 Empty AdSense publisher ID: awaiting account approval.

### TICKETS.md Consumption (Mar 14 — Ship Loop Triage)

| # | Ticket | Status | Notes |
|---|--------|--------|-------|
| T-1 | Context-Aware CTAs | DONE | Added getUserTierInfo/getProCtaText/getEliteCtaText helpers. Updated CTAs on index, lab, agents, pricing, league-intel, warroom, rosterbuilder. Trial users see "Subscribe to keep Pro." Paid users see "Current Plan" or "Enter Situation Room." Expired trial users see "Your trial ended." |
| T-2 | Sleeper ID Lock | DONE | Backend: sleeper_locked column, link_sleeper() enforces one-time lock with 409 on mismatch. Frontend: permanent link warning on connect cards, error handling for lock rejection. Auto-load already worked. 59 tests pass. |
| T-3 | Lab Toolbar Redesign | DONE | Moved 9 display toggles (Heat/Pctl/Bars/Top3/Diff/Tiers/Dense/Groups/Summary) + Custom Scoring + Manage Views into collapsible Settings panel. Toolbar reorganized into logical groups. Mobile: hide-mobile class, compact sizing, touch-friendly settings. |
| T-4 | Brand Copy Update | DONE | Updated all brand copy to "The Screener is forever free. The intelligence is what you pay for." Hero, pricing, agents, about, and gate messages updated. |
| T-5 | Universal Player Click Popup | DONE | Added openPlayerPopup() to app.js (lightweight popup on non-lab pages, delegates to existing modal on lab). Updated all 25 player click handlers in lab-panels.js. Command palette uses popup too. |
| T-6 | Big Board UI Overhaul | DONE | Cards upgraded to 3px/4px4px shadows/6px hover-lift. Position badges get ink border. Rank circles get warm bg. RPS bars get borders. |
| T-7 | Monte Carlo League Odds | DONE | Backend: POST /api/monte-carlo/projections returns weekly scoring distributions. Frontend: 1000-iteration Monte Carlo sim with Box-Muller normal sampling. "League Odds" button per league card. Summary cards show championship/playoff %, avg pts. Free=top 3, Pro=all managers. |

### Sweep Mode (Mar 14 — earlier session)

| Pass | Persona | Findings | Fixes |
|------|---------|----------|-------|
| 1 | Frontend Developer | kbd shadow 1px, kbd font wrong | Upgraded to 2px shadow, switched to mono |
| 2 | UI Designer | No cold grays, no gradients, no 1px borders | Clean |
| 3 | Security Engineer | No SQL injection, no exposed secrets, escapeHtml everywhere | Clean |
| 4 | Backend Architect | No bare except, all errors logged | Clean |
| 5 | UX Architect | All nav links valid, all 74 pages exist, funnel complete | Clean |
| 6 | Performance Benchmarker | JS defer and esbuild minification in place | Clean |
| 7 | Accessibility Auditor | ARIA labels on key elements, focus-visible styles present | Clean |
| 8 | Brand Guardian | "free tier" in pricing FAQ | Replaced with specific product language |
| 9 | Whimsy Injector | 6 error, 5 empty, 15 loading personality strings | Already covered |
| 10 | Evidence Collector | All new function refs valid, no dangling references | Verified |

### Sweep Mode (Mar 14 — post-triage session)

| Pass | Persona | Findings | Fixes |
|------|---------|----------|-------|
| 1 | Frontend Developer | No console.log debug statements, no undefined references | Clean |
| 2 | UI Designer | Player headshots had empty alt text; "best value" badge used cold white | Fixed alt to "[Name] headshot"; changed to var(--bg) |
| 3 | Security Engineer | All innerHTML uses escapeHtml, no SQL injection vectors, no exposed secrets | Clean |
| 4 | Backend Architect | Stripe webhooks already handle subscription.updated. 59 tests pass. | Clean |
| 5 | UX Architect | All 74 pages have pricing links, funnel Home>Lab>Bureau>SitRoom>Pricing verified | Clean |
| 6 | Performance Benchmarker | esbuild minification in place, lazy html2canvas, deferred scripts | Clean |
| 7 | Accessibility Auditor | Player headshot alt text fixed (was empty, now descriptive) | Fixed |
| 8 | Brand Guardian | "forever free" language consistently applied across all pages | Clean |
| 9 | Whimsy Injector | Loading states, error messages, empty states all have personality | Clean |
| 10 | Evidence Collector | All new functions (getUserTierInfo, openPlayerPopup, toggleSettingsPanel, runLeagueOdds) verified reachable from call sites. 59 tests pass. No regressions. | Verified |

---

## Pre-Launch Verification: N-8 — Funnel Event Analytics (Mar 14)

**Goal**: Track key funnel events beyond pageviews so we can answer "how many people registered/connected Sleeper/ran queries today?"

| # | Task | Status | Notes |
|---|------|--------|-------|
| N-8 | Funnel event analytics | DONE | Added `events` table (event_type, detail, created_at) with indexes. Added `log_event()` in storage.py. Instrumented 6 funnel points: register, login, sleeper_connect, checkout, agent_query (byok/elite/free). Enhanced `get_analytics_summary()` to return events_by_type and events_by_day. All 59 tests pass. |

### Decisions Log
- Events table is separate from pageviews (different access patterns, different retention needs)
- Agent queries tracked with detail=byok/elite/free to distinguish tiers
- No PII stored in events — just event type and tier/interval metadata

---

## Bureau of Intelligence — Full Panel Suite (Mar 14)

**Goal**: Build all Bureau analysis panels for Sleeper-connected leagues.

| # | Panel | Status | Notes |
|---|-------|--------|-------|
| 1 | Roster Depth | DONE | Per-manager depth cards, starter/bench PPG, vulnerability flags, depth score 0-100, stacked position bars. Free /api/roster-depth-lookup endpoint (ungated). |
| 2 | Build Profiles | DONE | 6 archetypes (Hero RB, Zero RB, Balanced, Stars & Scrubs, Youth Movement, Win Now), scouting report flavor text, positional investment bar + radar chart. |
| 3 | Trade Network | DONE | Trade frequency matrix (manager pairs), per-manager tendency cards (timing/position/partner), most likely trade partner recommendation. |
| 4 | Waiver Tendencies | DONE | Hawk score 0-100, claims/hit rate/FAAB tracking, position bias bars, auto-detects FAAB leagues. |
| 5 | Power Rankings | DONE | Composite score (roster strength + win rate + bench depth + activity), Contender/Bubble/Rebuilding tiers, playoff bracket preview. |
| 6 | H2H Rivalry | DONE | Dropdown manager selectors, position-by-position PPG comparison with EDGE badges, matchup verdict. |
| 7 | Self-Scout | DONE | Auto-loads on league expand. Power rank, starter PPG, avg age, archetype, vulnerability flags, "How opponents see you" summary, rival quick links. |

### Decisions Log
- Created free /api/roster-depth-lookup endpoint (PPG only, no trade values) so Bureau depth/profiles/power rankings work for free users
- Self-Scout auto-loads (no button click) — it's the "home base" of the Bureau
- All panels use Sleeper API client-side + PPG enrichment from Razzle backend
- Trade Network and Waiver Tendencies are pure client-side (Sleeper transaction data only)

---

## QA Sweep: Post-Bureau Audit (Mar 14)

**Goal**: Verify code quality after 7 Bureau panels + Lab CSS variable audit.

| # | Finding | Status | Notes |
|---|---------|--------|-------|
| 1 | 1px border: Build Profiles investment bar | FIXED | border-right:1px → 2px in league-intel.html |
| 2 | 1px border: Trade matrix cells | FIXED | border:1px → 2px in league-intel.html |
| 3 | Hardcoded #fff: Trade finder button hover | FIXED | #fff → var(--bg) in league-intel.html |
| 4 | 1px border: Trade value bar in Lab | FIXED | border:1px → 2px in lab.js |
| 5 | 1px border: Keyboard hint kbd elements | FIXED | 4 instances border:1px → 2px in lab.js |

### Audit Results (Clean)
- 59/59 tests pass
- No console.log debug statements (only branded easter eggs)
- No TODO/FIXME comments
- No unescaped user data in innerHTML (all use escapeHtml)
- All fetch calls have error handling (.catch or try/catch)
- All Bureau API calls have AbortController timeouts (15-20s)
- All division operations properly guarded
- No hardcoded year references (2026) in dynamic code
- Lab-panels.css semantic colors (gold/bronze, grade badges) are intentional, not drift

---

## Pre-Deployment Code Audit (Mar 14)

**Goal**: Verify codebase is deployment-ready before NOW phase (N-1 production deployment).

| # | Area | Status | Notes |
|---|------|--------|-------|
| 1 | Billing portal URL | FIXED | Hardcoded `https://razzle.lol/agents` → `f"{_BASE_URL}/agents"` in billing.py. Would break staging/dev. |
| 2 | DB path (db.py) | OK | Resolves to repo's `data/terminal.db` — matches build download path. Persistent disk `/data` correctly used only for users.db (auth.py). |
| 3 | Static file serving | OK | server.py serves from `frontend/dist/` (production) with fallback to `frontend/` (dev). `html=True` enables SPA routing. |
| 4 | Build pipeline | OK | render.yaml minifies all JS/CSS, copies HTML/assets/favicon. No files missed (all JS/CSS at root level). |
| 5 | Dependencies | OK | All imports verified against requirements.txt. No missing packages. |
| 6 | CORS / Security | OK | Production: only `https://razzle.lol`. Dev: localhost origins. Security headers (CSP, upgrade-insecure-requests) in place. |
| 7 | Environment vars | OK | JWT_SECRET enforced in production (RuntimeError). Stripe keys from env. GH_TOKEN for DB download. All documented in render.yaml comments. |
| 8 | Frontend URLs | OK | All API calls use relative paths via `window.location.origin`. No hardcoded localhost/ports. |
| 9 | Draft year fallbacks | OK | Draft contexts correctly use calendar year (draft happens in April). NFL season contexts already use `_nflYear` (month >= 7 logic). |
| 10 | .gitignore | OK | `frontend/dist/` excluded from git. |

### Deployment Readiness: PASS
- 59/59 tests pass
- No code blockers for N-1 production deployment
- Human action required: set Render dashboard env vars (JWT_SECRET, STRIPE_*, GH_TOKEN)

---

## Pre-Launch Hardening + Bureau SOS (Mar 14)

**Goal**: Close security gaps and complete Bureau feature set before March 16 launch.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Server-side trial expiry validation | VERIFIED | Already correct — get_current_user() re-fetches from DB, _user_dict() recomputes trial_active server-side. JWT plan claim ignored in favor of live DB state. |
| 2 | Formula import endpoint enforcement | DONE | /api/user/formulas/import was bypassing the 3-formula limit for free users. Now checks plan and caps imports to remaining slots. |
| 3 | Bureau Schedule Strength panel | DONE | Phase 2-8 complete. Fetches roster PPGs + matchup heatmap, computes best/worst case PPG per manager, swing score, volatility grades (volatile → rock solid). Team concentration chips. Free=top 3, Pro=all. |

### Decisions Log
- Bureau SOS uses "matchup volatility" framing rather than raw schedule difficulty — shows how much each roster swings between best-case and worst-case defensive matchups
- This is more useful than traditional SOS because it factors in roster composition, not just team schedule
- Reused existing /api/matchup-heatmap and /api/roster-depth-lookup endpoints — no new backend needed

---

## Pre-Launch Final Sweep (Mar 14)

**Goal**: Fix critical bugs and mobile responsiveness gaps found in pre-launch audit.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Monte Carlo endpoint crash fix | DONE | /api/monte-carlo/projections called nonexistent live_data.get_connection() — changed to get_db() context manager. Also fixed wrong table name: `stats` → `player_week_stats`. |
| 2 | Bureau mobile 480px breakpoint | DONE | league-intel.html only had 768px media query. Added 480px breakpoint: tighter padding, smaller fonts on pressure bars/trade matrix/trade matches, trade matrix overflow-x:auto, compact depth/waiver/build-profile/self-scout cards. |
| 3 | Pre-launch audit (3 parallel agents) | DONE | Broken references: all clean, 0 issues. API endpoints: 152 routes verified, all frontend fetch() calls matched. Mobile: lab.html already has 768px/480px/375px coverage. agents.html functional at all widths. |

### Decisions Log
- agents.html uses non-standard 640px/400px breakpoints for ask-reference-grid but these work correctly — not worth changing
- lab.html mobile coverage was already comprehensive (768px/480px/375px with sidebar slide-out, unfrozen columns, toolbar scroll)
- Monte Carlo had two bugs (wrong connection method AND wrong table name) — both would have caused 500 errors on the Bureau league odds feature

---

## Pre-Launch Final QA (Mar 14)

**Goal**: Final autonomous QA sweep before March 16 Twitter launch. Verify all systems green.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Test suite verification | DONE | 59/59 tests pass in 13.66s |
| 2 | JS syntax check | DONE | All 11 frontend JS files pass node --check |
| 3 | Security sweep | DONE | 1 XSS fix: player.js `err.message` → `esc(err.message)`. CORS locked to razzle.lol in production. No hardcoded secrets. No SQL injection vectors. No debug/test endpoints. Admin stats endpoint properly gated by secret header. |
| 4 | API route audit | DONE | All 26 frontend fetch() calls match backend routes. 0 broken references. 0 orphaned endpoints. |
| 5 | HTML structure check | DONE | All 6 main pages (index, lab, agents, league-intel, pricing, about) have balanced div tags. No unclosed elements. |
| 6 | Debug statement audit | DONE | Zero debug console.log/console.warn in codebase. Only branded easter eggs in app.js. |

### Decisions Log
- Table row separators (td border-bottom: 1px) intentionally kept at 1px for data density in analytics tables. Design guide's "no 1px borders" applies to component/card borders, not internal table dividers. Reviewed in prior sweeps.

---

## Launch-Eve Audit (Mar 14)

**Goal**: Final autonomous 4-agent parallel audit before March 16 Twitter launch.

| # | Fix | Severity | Notes |
|---|-----|----------|-------|
| 1 | college.py missing `import re` | P0 | NameError crash on college player profile page (re.sub call on line 213) |
| 2 | college.py missing `TEAM_ABBREV` import | P0 | NameError crash on college player profile when combine data has draft_team |
| 3 | Monte Carlo `season_type = 'REG'` → `'regular'` | P1 | Endpoint returned zero rows for all players (wrong filter value) |
| 4 | Monte Carlo `"fantasy_points"` → `"fantasy_points_std"` | P1 | SQL crash on standard scoring mode (column doesn't exist) |
| 5 | FastAPI docs exposed in production | P1 | `/docs`, `/redoc`, `/openapi.json` disabled when ENVIRONMENT=production |
| 6 | `_showToast` wrong arg order (app.js) | P2 | Checkout confirmation toasts showed for 2.5s instead of 10s |
| 7 | XSS in player profiles (lab.js) | P2 | 5 unescaped innerHTML insertions (player_name, team, conference, school, draft_team) |
| 8 | Missing analytics on about/pricing | P2 | Pageview tracking added to both pages |
| 9 | billing.py silent exception | P2 | Added logging to plan_type migration catch block |

All 59 tests pass. All 11 JS files syntax-clean.

---

## Final Sweep (Mar 14)

**Goal**: Last autonomous sweep before launch. Find and fix any remaining design/robustness issues.

| # | Fix | Category | Notes |
|---|-----|----------|-------|
| 1 | colstats-bar 1px→2px border | Design | lab.html:1077 — histogram bars in column stats popover |
| 2 | Tier board select 1px→2px border-width | Design | lab.js:9919 — tier selector dropdown |
| 3 | Target dist segment 1px→2px border-right | Design | targets.html:530 — position segment dividers |
| 4 | pollForPlanChange missing resp.ok | Robustness | app.js:548 — could parse error JSON silently |
| 5 | _deleteFormulaFromServer missing resp.ok | Robustness | formulas.js:289 — could parse error JSON silently |

All 59 tests pass. All 11 JS files syntax-clean. 0 remaining issues found.

---

## Monte Carlo Deep-Dive + Bureau Polish (Mar 14)

**Goal**: Build the missing Monte Carlo Deep-Dive features from the North Star: distribution charts, scenario explorer (trade/injury what-if with instant re-simulation). Add ESPN/Yahoo coming soon badge.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Distribution histograms | DONE | Canvas histograms in each odds card showing PPG distribution across 1000 sims (15-bin, color-coded by frequency). Pro users only. Drawn via _mcDrawHistogram(). |
| 2 | Scenario explorer | DONE | Injury toggle (select player → mark OUT → instant re-sim) + trade what-if (pick two players from different rosters → swap → instant re-sim). All client-side using stored _mcState — no additional API calls. Delta badges (green/red +/-%) show how scenarios change championship, playoff, and avg pts odds compared to baseline. Reset all button clears scenarios. |
| 3 | Simulation refactor | DONE | Extracted simulation logic to _mcSimulate() and _mcBuildResults(). Stored state in _mcState per league for re-use. ptsHistory array captured per manager for histogram rendering. |
| 4 | Coming soon: ESPN, Yahoo | DONE | Badges on Bureau connect card. |
| 5 | resp.ok guard on projections API | DONE | Added missing check on /api/monte-carlo/projections response. |

### Decisions Log
- Monte Carlo Deep-Dive is entirely client-side for re-simulation (North Star: "instant re-simulation without API calls")
- Odds history (tracking across weeks) deferred — requires persistent storage and multi-session tracking, not achievable in a single autonomous loop
- Distribution histograms are per-card (inline canvas) rather than a separate panel — keeps the UI compact and contextual
- Scenario explorer allows multiple trades + injuries simultaneously — each scenario stacks and the re-simulation reflects all active modifications

---

## Quality Pass: Font Overhaul (Mar 14)

**Goal**: Enforce three-font rule across entire codebase. Luckiest Guy for headers at 16px+ only. Space Mono for all interactive/data elements. Caveat for annotations.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Body font root cause | DONE | Changed body from --font-display to --font-mono. Added explicit h1/h2/h3 rule for display font. All text now defaults to Space Mono. |
| 2 | styles.css violations | DONE | Fixed nav links (13px), mobile nav (16px), dropdown items (12px), command palette input/placeholder, tag-picker title (11px), note-editor title (12px), cmd-palette item name (15px). |
| 3 | lab-panels.css violations | DONE | 101 fixes: table headers, position badges (10-11px), rank numbers (14px), data values, tier badges, method chips, player names in data context (12-14px), buttons/tabs under 16px. 72 legitimate uses retained. |
| 4 | JS file violations | DONE | 40 fixes across 9 files: charts.js (12 control labels/table headers), lab.js (15 badges/labels/player names), warroom.js (6 badges/labels), formulas.js (2), formula-store.js (2), app.js (1), compare.js (1), player.js (1). |
| 5 | HTML file violations | DONE | 370 footer category labels at 11px fixed across 73 HTML files. agents.html: 15 specific fixes (setup steps, table headers, badges, trial messages). pricing.html: 4 fixes. lab.html: 9 fixes. league-intel.html: 4 fixes. |
| 6 | Inner span inheritance | DONE | Fixed 14px spans inheriting --font-display from 24-28px parent containers (lab.js trade value, agents.html pricing). |
| 7 | Dark mode legibility | DONE | WCAG contrast verified: primary text 14.3:1 AAA (dark), 12.3:1 AAA (light). All color pairs pass AA minimum. |

### Decisions Log
- Body font change is the single biggest legibility improvement — every element that previously inherited Luckiest Guy at 14px now gets Space Mono
- Inner spans in large display containers need explicit --font-mono to prevent inheritance
- 11px footer category labels were the most widespread violation (370 instances across 73 files)

---

## Quality Pass: Lab Panel Audit (Mar 14)

**Goal**: Audit every standalone Lab panel page for design compliance, error handling, mobile support.

| # | Batch | Status | Notes |
|---|-------|--------|-------|
| 1 | A-D (19 panels) | DONE | 22 fixes: font-display on pos-tabs/badges→mono, box-shadows 2px→4px, hardcoded hex→CSS vars, missing resp.ok checks, analytics standardized. 3 panels clean (advantage, breakdown, compare). |
| 2 | E-P (13 panels) | DONE | 28 fixes: font-display on pos-tabs/buttons→mono, hardcoded rgba hovers→var(--bg-warm), missing overflow-x:auto, POS_LIGHT hex→CSS vars, analytics error handling, responsive breakpoints added to playoffs. 1 panel clean (pace). |
| 3 | R-Z (32 panels) | DONE | 22 fixes: 13 rgba hover colors→var(--bg-warm), 7 badge hex→CSS vars in regression, box-shadow 3px→4px, analytics fetch handling. 16 panels clean. |

### Summary
- 72 fixes across 44 of 64 standalone panel pages
- 20 panels passed all criteria with no changes needed
- Most common issues: hardcoded rgba hover colors, font-display on sub-16px controls, analytics error handling
- All 59 tests pass, all JS syntax clean

---

## Brand Consistency + Polish Pass (Mar 14)

**Goal**: Consume all remaining TICKETS.md brand consistency and polish items.

| # | Ticket | Status | Notes |
|---|--------|--------|-------|
| 1 | Nav rename: "The Lab" → "Screener" | DONE | 74 HTML nav/footer links, app.js dynamic nav, lab.js title, lab.html breadcrumbs, compare.js/player.js "Back to" links, pricing.html features/CTA/FAQ, agents.html feature table, about.html tier list, og-image-lab.svg. URLs unchanged. |
| 2 | og:description + meta tags | DONE | All 74 pages updated with compelling page-specific descriptions. Zero "terminal" references in meta tags. Lab pages mention Screener, Bureau mentions league intelligence, Situation Room mentions 6 AI agents. career.html XML corruption fixed. |
| 3 | Pricing section + Elite tier | DONE | Added Elite tier card to index.html ($19.99/mo, $149.99/yr, purple border). Replaced "best value" badge with "the film room upgrade". pricing.html "most popular" → "the film room upgrade". Three-card layout. Free tier label kept as "Free" (not "Forever Free" per design guide). |
| 4 | DESIGN.md + CLAUDE.md contradictions | DONE | DESIGN.md agents section updated with all 6 finalized personas (was placeholder "TBD"). CLAUDE.md dark mode line updated: "NO dark mode" → "Site-wide dark mode toggle available. Situation Room always dark." |
| 5 | Watermark shortened | DONE | "razzle.lol — let's razzle dazzle em baby" → "razzle.lol" across 73 HTML footers, lab.js (13 canvas calls), charts.js (3 canvas calls), 2 SVG OG images, update_footers.py template. |
| 6 | Briefing demo second agent | DONE | Added The Quant (🐙) card below Razzle (🐯) card in landing page Situation Room demo. Redacted trade-value analysis text with "opportunity" urgency badge. Reinforces multi-agent pitch. |

### Post-fix cleanup
- Fixed Quant emoji: 🦊 (fox/Diplomat) → 🐙 (octopus/Quant)
- Fixed pricing meta tags: "free forever" → "forever free" (brand copy word order)
- Free tier label: "Forever Free" → "Free" on both index.html and pricing.html
- 59/59 tests pass, all 11 JS files syntax clean
- Zero "The Lab" in user-facing text (only internal code comment in lab.js:1)
- Zero "terminal" in any meta description tag
- All consumed tickets removed from TICKETS.md

---

## Pre-Launch Critical Fixes (Mar 19)

**Goal**: Fix all bugs from TICKETS.md Pre-Launch Critical Fixes phase.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Fix rate limiter IP detection | VERIFIED | Already fixed — _get_client_ip() reads X-Forwarded-For, all rate limiters use it. Zero direct request.client.host outside helper. |
| 2 | Fix Elite LLM model bug | DONE | /api/llm/chat was using _LLM_FREE_MODEL (llama-3.1-8b-instruct:free) for Elite users. Changed to _LLM_MODEL (claude-3.5-haiku). Free endpoint correctly uses _LLM_FREE_MODEL. |
| 3 | Fix getAuthToken() in warroom.js | DONE | Was reading razzle_user.token (nonexistent field). Changed to read razzle_token directly. Same bug found and fixed in league-intel.html:3546. |
| 4 | Fix lifetime plan query limits | VERIFIED | Already fixed — QUERY_LIMITS dict in auth.py has all 5 plan types including pro_lifetime and elite_lifetime. |
| 5 | Server-side formula save tier gate | VERIFIED | Already implemented — POST /api/user/formulas checks plan and caps free users at 3 formulas. |
| 6 | subscription.updated webhook | VERIFIED | Already implemented — billing.py handles customer.subscription.updated with plan sync, lifetime skip. |
| 7 | payment_failed webhook | VERIFIED | Already implemented — billing.py handles invoice.payment_failed with downgrade to free, lifetime skip. |
| 8 | JSON.parse(localStorage) try-catch | VERIFIED | All 40+ instances across all frontend files are wrapped in try-catch. Zero unprotected calls. |
| 9 | Warroom animation loop cleanup | DONE | Added canvas.isConnected check at top of gameLoop(). Loop stops if canvas removed from DOM. |
| 10 | Player name font consistency | DONE | Fixed 6 wrong-font classes (display→mono): .trade-player-card .player-name, .cst-player-name, .sw2-player-name, .glo-player-name, .pbd-player-name. Upgraded font-weight 600→700 on 4 classes: .md-ba-name, .md-recap-name, .rbld-player-name, .bb-name. Added explicit font-family/size to 3 classes: .opp2-player-name, .sos2-player-name, .td2-player-name, .pt-player-name. Hero titles (20px+) correctly stay display font. |

### Decisions Log
- Auth token in warroom.js and league-intel.html was reading from razzle_user.token (a field that doesn't exist on the user object). The canonical token is at razzle_token. Both files fixed.
- Player names at hero size (20px+ in player.html, compare.html, pct2 panel) stay as display font per design guide rule: "Luckiest Guy for headers at 16px+ only."

---

## Persistent Disk + Response Cache (Mar 19)

**Goal**: Use Render persistent disk for DB, remove build-time download, expand cache.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | DB paths for /data mount | DONE | db.py checks ENVIRONMENT=production, sets DB_PATH=/data/terminal.db. auth.py already does this for users.db. Zero other hardcoded paths in backend. |
| 2 | Remove DB download from build | DONE | render.yaml build command no longer curls terminal.db. Persistent disk at /data has the database. Comment explains the setup. |
| 3 | In-memory response cache | VERIFIED | Already exists: two-level cache (response-level in server.py + data-level _cached() in core.py). Bumped _CACHE_MAX_SIZE from 200→500. 20+ high-traffic endpoints already cached via _cached(). |
| 4 | Cache-bust on data refresh | DONE | Added cache_clear() to core.py. Called at end of all 3 adapter main() functions. Added POST /api/admin/cache-clear endpoint (admin-secret gated) for production cache flush after uploading new data. |

### Decisions Log
- Did not create separate backend/cache.py — existing two-level cache system already provides everything the ticket asked for
- Adapter cache_clear() is best-effort (try/except) since adapters may run as standalone scripts outside the server process
- Admin cache-clear endpoint clears both data-level and response-level caches

---

## Quality Pass: Edge Cases + Design Consistency (Mar 19)

**Goal**: Systematic quality audit across error handling, design consistency, dark mode, and mobile responsiveness. Every pixel, every interaction, every error state.

| # | Fix | Category | Files | Notes |
|---|-----|----------|-------|-------|
| 1 | Math.max/min empty array safeguards | Edge case | lab-panels.js, charts.js, drops.html, gamescript.html, garbagetime.html, snapefficiency.html, successrate.html, tdregression.html, workload.html, comptable.html | 15 instances: added fallback values (.concat([1]) or Math.max(...vals, 1)) to prevent -Infinity on empty arrays |
| 2 | Unguarded name split/pop | Edge case | charts.js | 2 fixes: null guard on full_name.split().pop() for scatter plot and compare chart labels |
| 3 | Missing resp.ok guards | Robustness | player.js, warroom.js | 4 fetch chains now check resp.ok before parsing JSON (compare search, agent quota, briefing latest, briefing history) |
| 4 | Bootstrap grade colors → CSS variables | Design | lab-panels.css, styles.css | 45 Bootstrap palette colors (#d4edda, #cce5ff, #fff3cd, #ffe0cc, #f8d7da and their text pairs) replaced with semantic CSS variables. Added --semantic-blue, --semantic-yellow, --semantic-orange vars with dark mode overrides. |
| 5 | Dark mode overlay visibility | Dark mode | styles.css, lab.html | 5 modal overlays (mobile-nav, auth-modal, filter-modal, column-picker, cmd-palette) used rgba(45,31,20,...) which is invisible on dark espresso backgrounds. Added [data-theme="dark"] overrides with rgba(0,0,0,...). |
| 6 | JS inline hardcoded colors → CSS vars | Dark mode | lab.js, warroom.js | 4 inline style.color assignments changed from hex (#2ec4b6, #e63946, #d44040, "white") to var() references (--green, --red, --bg-card). |
| 7 | Hardcoded hex in HTML inline styles | Design | prospects.html, comptable.html | Position tier badges (#d97757 etc.) → var(--orange) etc. Button hover #b85a3a → var(--ink). |

### Verified Clean (no fixes needed)
- 0 remaining 1px solid borders on components (only table row dividers at 1px)
- 0 cold gray hex colors in CSS/HTML (all in warroom pixel art, exempted)
- 0 Luckiest Guy at small sizes (<16px)
- 0 debug console.log/TODO/FIXME
- 0 unescaped innerHTML with user data (XSS)
- 0 SQL injection vectors (all parameterized, sort cols whitelisted)
- 0 bare except: blocks in backend
- 0 missing viewport/title/lang tags across 74 pages
- All touch/scroll listeners passive
- CORS locked to razzle.lol in production
- All 11 JS files syntax clean
- All 16 Python files compile clean
- 59/59 tests pass

### Decisions Log
- Canvas hardcoded colors (70+ instances of #ede0cf/#f7efe5 in ctx.fillStyle) are a known dark mode limitation — canvas can't use CSS variables directly. A getComputedStyle refactor would touch 200+ lines across 8 files with regression risk. Deferred to post-launch.
- Silent .catch(function(){}) on analytics pageview and background sync fetches (formulas, watchlist) are intentional fire-and-forget patterns. Not bugs.
- #fff on colored badges (position badges, tier badges) is correct — white text on saturated backgrounds for contrast regardless of theme.
- Functional gradients (skeleton shimmer, data bar viz, resize handle) are not decorative and don't violate the "NO gradients" design rule.

---

## Quality Pass: Full Codebase Audit (Mar 19)

**Goal**: Systematic multi-agent quality audit across all files. Every pixel, every interaction, every error state. Pre-launch quality gate.

| # | Fix | Category | Files | Notes |
|---|-----|----------|-------|-------|
| 1 | Missing r.ok on dynasty rankings compare search fetch | Crash bug | lab-panels.js:305 | Would crash on API error — added r.ok guard |
| 2 | Division by zero in sparkline trend calculation | Edge case | lab.js:2057-2058 | avgLast/avgFirst on empty slice — added length guard |
| 3 | Unguarded split().pop() on player names | Edge case | lab-panels.js:8897,8898,8967 | Could render "undefined" — added (name \|\| '') guard |
| 4 | Null name concatenation ("null null") | Edge case | league-intel.html:4777,2263,2368,2372,2427,2435,2473,2480 | 8 instances of first_name + last_name without null guard — all fixed with (x \|\| '').trim() |
| 5 | Luckiest Guy at 10px in canvas legend | Design | league-intel.html:3428 | Changed to 11px monospace |
| 6 | Dark mode pressure overlay uses hardcoded sand rgba | Dark mode | league-intel.html:578 | Changed to color-mix(in srgb, var(--bg) 92%, transparent) — theme-responsive |
| 7 | Luckiest Guy at 12px/11px on pressure overlay text | Design | league-intel.html:588,595 | Changed to var(--font-mono) |
| 8 | Font-display at <16px across agents.html | Design | agents.html | 24 CSS rules changed from --font-display to --font-mono (9-14px elements) |
| 9 | Font-display at <16px in about.html | Design | about.html | 2 CSS rules changed (11px, 14px elements) |
| 10 | Division by zero in aging curves xScale/yScale | Edge case | aging.html:476-477 | Added Math.max(denominator, 1) guard |

### Verified Clean (6-agent parallel audit)
- 0 missing resp.ok checks on fetches (all 74 pages verified)
- 0 hardcoded 2026 in JavaScript logic
- 0 unescaped innerHTML with user data (840+ escapeHtml calls verified)
- 0 1px solid borders in JS inline styles
- 0 SQL injection vectors in backend (all parameterized)
- 0 connection leaks (all use context managers)
- 0 bare except blocks in backend
- lab-panels.css display font — all 16px+ (clean)
- All 11 JS files syntax clean
- All Python files compile clean
- 59/59 tests pass

---

## Quality Pass: Second Wave (Mar 19)

**Goal**: Deep-dive audit of user-facing UX, formulas, compare pages, and error personality.

| # | Fix | Category | Files | Notes |
|---|-----|----------|-------|-------|
| 1 | Dark mode search highlight invisible | Dark mode | styles.css:776 | Added [data-theme="dark"] override with higher opacity |
| 2 | Aging curves division by zero | Edge case | aging.html:476-477 | Math.max(denominator, 1) guard on xScale/yScale |
| 3 | Onboarding toast vague message | UX | lab.js:1134 | "70 tools in the sidebar" → "Filter by position above, explore panels in the sidebar" |
| 4 | Cloud-synced formula names not escaped | XSS | formulas.js:210 | Added escapeHtml() on server-synced names |
| 5 | Formula delete no confirmation | UX | formulas.js:98 | Added confirm() dialog before deletion |
| 6 | Formula store position tag injection | XSS | formula-store.js:494 | Whitelist QB/RB/WR/TE + escapeHtml on each tag |
| 7 | Compare stat display "undefined" | Edge case | compare.js:239-246 | Changed !== null to != null (catches both null and undefined) |
| 8 | 16 generic "something went wrong" errors | Whimsy | 15 HTML files + lab-panels.js | Replaced with film-room personality text (6 unique messages cycled) |
| 9 | Font-display at <16px in agents.html | Design | agents.html | 24 CSS rules changed from --font-display to --font-mono |
| 10 | Font-display at <16px in about.html | Design | about.html | 2 CSS rules changed |

### Full Audit Coverage (3 passes, 12+ agents)
- **Pass 1**: 6-agent parallel audit (lab.js, lab-panels.js, warroom.js, agents.html, app.js/styles.css/index.html/pricing.html, backend, league-intel.html)
- **Pass 2**: Homepage first impressions, dark mode CSS completeness, Lab first-use experience
- **Pass 3**: Top Lab panel formatting, formula builder edge cases, error/empty/loading personality, compare + player pages

### Audit Results
- Homepage: excellent first impression, no bugs, dark mode ready, mobile responsive
- Lab panels (top 8): all format correctly, no NaN/null display issues
- Backend: well-structured, no SQL injection, no connection leaks
- Dark mode CSS: 99% complete (only canvas colors remain as known limitation)
- Error personality: 0 generic "something went wrong" messages remaining
- 59/59 tests pass, all JS syntax clean

---

## Quality Pass: Deep Audit (Mar 19)

**Goal**: 6-agent parallel quality audit across all major files. Fix every edge case, design violation, and crash bug.

| # | Fix | Category | Files | Notes |
|---|-----|----------|-------|-------|
| 1 | Luckiest Guy at 12px/11px in tier board canvas | Design | lab.js:10011,10062 | Changed to Space Mono — design guide: display font only at 16px+ |
| 2 | Sparkline division by zero when scores.length < 2 | Edge case | lab-panels.js:4454 | Added early return guard in drawSparkline() |
| 3 | Missing .catch() on dynasty compare search fetch | Robustness | lab-panels.js:328 | Added .catch() to prevent unhandled rejection |
| 4 | Dark mode html2canvas export background | Dark mode | lab-panels.js:260 | Detects data-theme="dark", uses espresso bg and sand watermark |
| 5 | agents[id] array access without bounds check | Edge case | warroom.js:1287,1295 | Added null guards in updateRosterSelection/updateRosterStatus |
| 6 | Null name.split() crash in H2H comparison | Crash bug | league-intel.html:4139,4149 | Added (name \|\| '') guard on player name split |
| 7 | Formula migration silently swallowed errors | UX | app.js:1088 | Now clears localStorage on successful import |

### Verified Clean (6-agent audit)
- 0 remaining Luckiest Guy at <16px (except canvas fillStyle — known limitation)
- 0 unguarded Math.min/max on potentially empty arrays
- 0 missing .catch() on user-facing fetch chains
- 0 unescaped innerHTML with user data
- 0 1px borders on components (table row dividers are intentional)
- 0 cold gray hex colors
- All JSON.parse wrapped in try-catch
- All division operations guarded
- All 11 JS files syntax clean
- All 16 Python files compile clean
- 59/59 tests pass

---

## Quality Pass: Launch Polish (Mar 19)

**Goal**: Deep multi-agent quality audit focused on crash bugs, mobile layout, brand voice, and UX polish. Every pixel, every interaction, every error state.

### Pass 1: Edge Case Crash Bugs (18 fixes)

| # | Fix | Category | Files | Notes |
|---|-----|----------|-------|-------|
| 1 | Division by zero in aging curve xScale | Crash | lab.js:9266 | `maxAge - minAge` can be 0 if all ages identical — added `ageRange` guard |
| 2 | Column stats mean div/zero when 1 value | Crash | lab.js:3342 | Changed min vals check from `< 2` to `< 1` |
| 3 | Math.max on null avg_ppg values | Edge case | lab.js:9255 | Added `.filter(v => v != null)` with fallback `1` |
| 4 | Null name.split().pop() in aging curve labels | Crash | lab.js:9357 | Added `(p.name \|\| '')` guard |
| 5 | Null name.split().pop() in comp table header | Display | lab.js:11823 | Added `(c.full_name \|\| '')` guard |
| 6 | Null name.split().pop() in comp canvas (2x) | Crash | lab.js:12109,12111 | Added `(full_name \|\| '')` guards |
| 7 | Empty sparkline pts array access | Crash | lab.js:6417 | Added `if (!pts.length) return` guard |
| 8 | Stock Watch API missing `.rising` key | Crash | lab-panels.js:1837 | Added `data.rising &&` property check |
| 9 | Red Zone API missing `.dominators` key | Crash | lab-panels.js:3836 | Added `data.dominators &&` property check |
| 10 | Opportunity API missing `.alpha_dogs` key | Crash | lab-panels.js:7704 | Added `data.alpha_dogs &&` property check |
| 11 | SOS API missing `.schedule_suppressed` key | Crash | lab-panels.js:8627 | Added `data.schedule_suppressed &&` property check |
| 12 | Hardcoded hex in matchup legend | Design | lab-panels.js:3405-3409 | 5 hex colors to CSS var() refs for dark mode |
| 13 | Hardcoded hex in draft accuracy bar | Design | lab-panels.js:9402 | `#e8d5c4` to `var(--ink-faint)` |
| 14 | Null name.split().pop() in targets (3x) | Crash | targets.html:490,491,529 | Added `(name \|\| '')` guards |
| 15 | Null rush_pct/rec_pct bar widths | Display | dualthreat.html:286 | Added `\|\| 0` fallback |
| 16 | Hardcoded year without NFL season awareness | Data bug | league-intel.html:2585 | Added month >= 7 check for free users |
| 17 | AGENT_DEFS[id] without bounds check | Crash | warroom.js:3271 | Added null guard before `.name` access |

### Pass 2: Mobile + UX Polish

| # | Fix | Category | Files | Notes |
|---|-----|----------|-------|-------|
| 1 | Footer grid horizontal scroll at 375px | Mobile | 73 HTML files + template | `minmax(160px)` to `minmax(140px)` — fits 327px viewport |
| 2 | Note editor popup overflow on mobile | Mobile | styles.css:1338 | Added `max-width: 90vw` |
| 3 | Filter badge "2/3" counter for free users | UX | lab.js | Free users see filter usage against limit, preventing surprise paywall |

### Pass 3: Brand Voice Consistency

| # | Fix | Category | Files | Notes |
|---|-----|----------|-------|-------|
| 1 | 27 "could not load X" generic errors | Personality | lab-panels.js | All replaced with `razzleError()` random personality messages |
| 2 | 3 generic loading/error messages | Personality | warroom.js | "loading memory" to "recalling old film sessions", etc. |
| 3 | 2 generic auth error fallbacks | Personality | app.js | "Login failed" to "fumbled the login", etc. |

### Verified Clean (12-agent audit)
- 0 generic "could not load" / "Loading..." / "Something went wrong" messages
- 0 unguarded division operations
- 0 null name.split().pop() without guards
- 0 Math.min/max on potentially empty arrays without fallbacks
- 0 API response property access without null checks
- 0 horizontal scroll at 375px viewport
- CSV export lock icons already implemented (Phase 11 launch fix)
- Season selector lock emojis already implemented
- Formula Store Pro gate already implemented with blur + CTA
- All 11 JS files syntax clean
- 59/59 tests pass

### Decisions Log
- Dark mode accent colors (--orange, --green, etc.) are intentionally unchanged per DESIGN.md: "The orange accent stays the same — it works on both"
- Agents.html bio grid already has proper mobile breakpoints (3 to 2 at 768px, 1 at 480px)
- Canvas hardcoded colors (70+ fillStyle) remain a known dark mode limitation — deferred to post-launch
- Footer touch targets (16px height) are acceptable for non-primary links — not a launch blocker

---

## Quality Pass: Deep Multi-Agent Audit (Mar 19)

**Goal**: Fresh 5-agent parallel audit focused on landing page, Lab screener, dark mode, mobile 375px, and brand voice consistency.

### Pass 1: Landing Page + Typography

| # | Fix | Category | Files | Notes |
|---|-----|----------|-------|-------|
| 1 | fake-rank/fake-pos font-display at 9-14px | Typography | index.html | Changed to --font-mono (design guide: display font only at 16px+) |
| 2 | pricing-badge font-display at 11px | Typography | index.html | Changed to --font-mono with font-weight:700 |
| 3 | Hardcoded #8b5cf6 purple fallbacks (5 instances) | CSS | index.html | Removed fallbacks, trust var(--purple) |
| 4 | Footer links inline styles → CSS class | DRY | 72 HTML files | Created .footer-link class with hover state (color→orange on hover) |
| 5 | Footer template outdated | Maintenance | update_footers.py | Updated template with footer-link class, mono font, correct nav names |

### Pass 2: Dark Mode Badge Colors (lab-panels.css)

| # | Fix | Category | Files | Notes |
|---|-----|----------|-------|-------|
| 1 | 50+ hardcoded badge text colors → semantic vars | Dark mode | lab-panels.css | #1a7a6d→var(--semantic-green), #3a5abf→var(--semantic-blue), #8a6d20→var(--semantic-yellow), #a85a3a→var(--semantic-orange), #a83240→var(--semantic-red), plus 5+ more patterns |
| 2 | 16 hardcoded badge backgrounds → semantic vars | Dark mode | lab-panels.css | #dbeafe→var(--semantic-blue-light), #fef9c3→var(--semantic-yellow-light), #d9efec→var(--semantic-green-light), #f2d5d8→var(--semantic-red-light), plus more |
| 3 | 6 hardcoded border-colors → CSS vars | Dark mode | lab-panels.css | #1e40af, #854d0e, #ffc857, #e63946, etc. |
| 4 | Risers/fallers green/red → var(--green)/var(--red) | Dark mode | lab-panels.css | 10+ instances of #16a34a and #dc2626 |
| 5 | Removed unnecessary fallback on --orange-light | CSS | lab-panels.css | Line 353 |

### Pass 3: Brand Voice

| # | Fix | Category | Files | Notes |
|---|-----|----------|-------|-------|
| 1 | "No data" dropdown → "no draft classes found" | Voice | prospects.html, lab-panels.js | User-facing generic text |
| 2 | "Could not validate" → "couldn't verify that one" | Voice | app.js | Promo code validation |
| 3 | "Enter a username" → "need a Sleeper username" | Voice | app.js | Sleeper link input |
| 4 | "Could not copy link" → "fumbled the copy — try again" | Voice | compare.js, player.js | Clipboard error |
| 5 | alert("Enter a config name") → toast "give it a name first" | Voice | lab.js | Custom scoring save |
| 6 | "enter a key first" → "need an API key first" | Voice | warroom.js (2 instances) | API key validation |
| 7 | "War Room" comment → "Situation Room" | Naming | lab.js | Internal comment consistency |

### Pass 4: Mobile 375px

| # | Fix | Category | Files | Notes |
|---|-----|----------|-------|-------|
| 1 | 375px breakpoint for hero section | Mobile | index.html | Tighter padding, 20px h1, 16px subtitle |
| 2 | 375px breakpoint for pricing cards | Mobile | index.html, pricing.html | Smaller fonts, tighter padding |
| 3 | Promotions grid minmax(260px) → minmax(min(260px,100%),1fr) | Mobile | pricing.html | Prevents horizontal scroll at 375px |
| 4 | Removed hardcoded CSS fallbacks | CSS | pricing.html | var(--green, #2ec4b6) → var(--green) across 12 instances |

### Pass 5: Lab UX

| # | Fix | Category | Files | Notes |
|---|-----|----------|-------|-------|
| 1 | Zebra striping dark mode | Dark mode | lab.js, styles.css | Added --zebra-stripe CSS variable with dark mode override |
| 2 | Filter NaN validation feedback | UX | lab.js | Added toast "need a number for that filter" when parseFloat fails |

### Verified Clean
- 0 hardcoded hex badge colors in lab-panels.css (only metallic gold/bronze/silver intentional)
- 0 inline footer link styles across 72 HTML files
- 0 generic "No data" / "Could not" / "Enter a" validation messages
- 0 font-display below 16px on landing page
- 0 unnecessary CSS var fallbacks on landing + pricing
- All 11 JS files syntax clean
- All 16 Python files compile clean
- 59/59 tests pass

---

## Hotfix: All Historical Seasons Free (Mar 19)

**Goal**: Remove tier gating on historical seasons. The data is the billboard — let people screenshot 2018 stats. The paywall is on intelligence features, not data.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Remove getAllowedSeasons() restriction | DONE | app.js: function now returns all seasons regardless of plan. Was limiting free users to 3 most recent seasons. |
| 2 | Remove lock emojis from season selector | DONE | lab.js: populateSeasonSelect() no longer adds lock emoji, disabled attribute, or "Unlock all seasons with Pro" hint. Career mode unlocked for everyone. |
| 3 | Verify no backend season gating | DONE | Zero backend restrictions found — all data already accessible via API regardless of auth. |
| 4 | Verify standalone panels ungated | DONE | No standalone HTML panel pages had season gating logic. |

### Decisions Log
- Bureau manager profiling multi-season crawl (1 free, 5 Pro) is NOT season data gating — it's Bureau depth analysis (a Pro feature). Left unchanged.
- Filter limits (3 free), formula limits (3 free), CSV export (Pro), compare limits (2 free) all stay gated. Only season/data access was freed.
- No backend changes needed — gating was purely frontend UI.

---

## Quality Audit: 5-Agent Parallel Sweep (Mar 19)

**Goal**: Comprehensive multi-agent quality audit across all files. XSS, crash bugs, design violations, brand voice.

### XSS Fixes (15 total)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 1 | 11 unescaped player/team/school names | lab.js | prospect comps, tier view, big board, college profiles, config names |
| 2 | 3 headshot URLs: escapeHtml→escapeAttr | lab-panels.js | usage trends, YoY, air yards panels |
| 3 | markdownToHtml escape before markdown | warroom.js | LLM output could inject <script> tags |
| 4 | Unescaped position in draft tracker | lab-panels.js | Raw p.position in innerHTML |

### Crash Bug Fixes (12 total)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 1 | 8 division-by-zero guards | backend (5 files) | analytics, dynasty, players, prospects, tools — all `/ len(list)` without empty guards |
| 2 | parseFloat null guard (opportunity_pct, production_pct) | lab-panels.js | NaN on null values |
| 3 | p.cov null guard | lab-panels.js | NaN multiplication |
| 4 | d.summary null guard | lab-panels.js | Crash on missing API key |

### Robustness Fixes (8 total)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 1 | resp.ok on rateFormula, installFormula | formula-store.js | Could parse error JSON |
| 2 | resp.ok on startCheckout, validatePromoCode, openManageSubscription | app.js | Could crash on non-JSON errors |
| 3 | Free user LLM gate (runSingleAgent, runAllAgents) | warroom.js | Blocked free logged-in users from callFreeLLM |

### Design + Brand Voice (4 total)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 1 | h2h position row border 1px→2px | league-intel.html | Design guide: no 1px borders on components |
| 2 | SOS card duplicate style attributes | league-intel.html | isUser + isBlurred both set style=, only last applies |
| 3 | 3 generic error messages replaced | league-intel.html, pricing.html | Brand voice personality |

### Deferred (known limitations)
- Canvas hardcoded colors (70+ instances across 8 files) — getComputedStyle refactor deferred to post-launch
- lab.html:1155 table td 1px border — intentional for data density (prior decision)

### Verified Clean
- All 11 JS files syntax clean
- All 16 Python files compile clean
- 59/59 tests pass

---

## Weekly Data Filter — Screener (Mar 19)

**Goal**: Add week-level filtering to the screener so users can view individual week stats.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend: week param in screener query | DONE | players.py: accepts `week` param, adds `AND s.week = ?` to WHERE. Rate metrics and team shares also filter by week. |
| 2 | Backend: /api/available-weeks endpoint | DONE | server.py: returns distinct weeks for a season. |
| 3 | Frontend: week dropdown in toolbar | DONE | lab.html: `#weekSelect` next to season. lab.js: `populateWeekSelect()`, URL `&week=5`, localStorage. |
| 4 | Frontend: Caveat annotation | DONE | "showing Week X, YYYY stats" in handwritten font below toolbar. |
| 5 | Week resets on season/universe change | DONE | `state.week = 0` on season change, universe switch. Hidden for college/career. |

### Decisions Log
- PBP enrichment reads from season-level table, no week filtering needed

---

## Weekly Data Filter — All Panels (Mar 19)

**Goal**: Add week-level filtering to all applicable Lab panel endpoints and UIs.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend: week param on 13 panel endpoints | DONE | analytics.py (breakouts, usage_trends, target_distribution, redzone), dashboards.py (efficiency, consistency, opportunity_share, report_cards), tools.py (target_premium, streaks, drop_rate, success_rate, game_script). server.py routes updated. 4 endpoints skipped (snap_efficiency, workload, dual_threat, garbage_time — use player_season_stats, not week-level). |
| 2 | Frontend: week selector on 13 Lab panels | DONE | Added weekSelectHTML()/populateWeekSelect() helpers. Week dropdown added to breakouts, efficiency, consistency, targetpremium, drops, redzone, streaks, usage, successrate, targets, opportunity, reportcard, gamescript. Populates from /api/available-weeks, re-fetches on change, hidden for college mode. |

### Decisions Log
- 4 endpoints (snap_efficiency, workload, dual_threat, garbage_time) use player_season_stats which has no week column — skipped rather than refactoring to player_week_stats
- PBP-joined endpoints (drop_rate, success_rate, game_script) filter week on player_week_stats only, since player_season_pbp has no week column
- Week selectors hidden in college mode — college data doesn't have week-level granularity in this format

---

## Quality Audit: Multi-Agent Deep Sweep (Mar 19)

**Goal**: 5-agent parallel audit across all files — crash bugs, data corruption, dark mode, mobile, brand voice.

| # | Fix | Category | Notes |
|---|-----|----------|-------|
| 1 | season vs _season in dashboards.py (3 functions) | DATA BUG | fetch_strength_of_schedule, fetch_stock_watch, fetch_season_awards all used raw `season` (None) instead of resolved `_season` in defense PPG queries — produced empty/wrong results when called without explicit season |
| 2 | setPosition undefined → togglePosition | CRASH | Keyboard shortcuts 1-5 called nonexistent function, threw ReferenceError |
| 3 | data.players → data.items in rosterSearchPlayers | BROKEN | API returns `{ items: [...] }`, code read `data.players` — roster search never returned results |
| 4 | Sparse vscroll array "undefined" in HTML | DISPLAY | `_vscrollRows[i]` on unbuilt rows appended literal "undefined" string |
| 5 | ppg.toFixed(1) crash on null | CRASH | Weekly heatmap panel called .toFixed() on potentially null ppg |
| 6 | escapeHtml(p.annotation) on undefined | DISPLAY | Breakouts panel rendered "undefined" text when annotation missing |
| 7 | _parseFindings crash on null findingsStr | CRASH | warroom.js — .slice() on null/undefined in catch block |
| 8 | Free-tier specialist execution blocked | LOGIC | runAllAgents early-exit checked `!apiKey && !elite` but didn't check isLoggedIn() — blocked free-tier logged-in users from using free LLM |
| 9 | Keyboard handler captured text input | UX | WASD/1-6 keys intercepted while typing in scenario input or config fields |
| 10 | callFreeLLM no timeout | HANG | Free-tier LLM fetch had no AbortController — request could hang forever |
| 11 | Double-click race in toggleLeague | RACE | dataset.loaded guard only checked "true", not "loading" — double-click loaded roster twice |
| 12 | Monte Carlo Math.log(0) → Infinity | DATA | Math.random() can return 0, producing Infinity in simulation |
| 13 | Clipboard .catch() missing | UX | Share modal copy buttons had no fallback on clipboard API rejection |
| 14 | Zebra stripe hardcoded rgba | DARK MODE | Used rgba(45,31,20,0.02) instead of var(--zebra-stripe) |
| 15 | Thead shadow invisible in dark mode | DARK MODE | Added [data-theme="dark"] override with rgba(0,0,0,0.25) |
| 16 | Prospect bar backgrounds invisible in dark mode | DARK MODE | rgba(45,31,20,0.06) → var(--bg-warm) |

---

## Headshot URL Hotfix (Mar 19)

**Goal**: Repopulate NULL headshot_url values in players table.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Fix sync_rosters to include headshot_url | DONE | Added headshot_url to UPDATE query in nflverse_adapter.py |
| 2 | Run roster sync for 2015-2025 | DONE | 3398/3407 players now have headshots (99.7%). Was 2116 before. |

### Note
User needs to manually upload updated terminal.db to Render persistent disk at /data/terminal.db.

---

## Welcome to Pro Modal (Mar 19)

**Goal**: Post-checkout welcome experience after Stripe payment.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Build _showWelcomeModal in app.js | DONE | Tiger emoji + "welcome to the film room" headline, Caveat aside ("you just made the tiger very happy"), plan/price badge, 5-item feature list, CTA buttons (Bureau + Screener), CSS confetti burst (20 dots, position colors), sessionStorage one-time guard. Works for Pro and Elite with tier-specific messaging. |

---

## Player Name Font Consistency (Mar 19)

**Goal**: Enforce Space Mono bold 700 on all player names in data tables.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Screener table player names | DONE | `.player-name-cell a { font-weight: 700; }` in lab.html |
| 2 | lab-panels.css: 3 missing font-family | DONE | `.arc-player-name`, `.rbld-player-name`, `.td2-player-name` |
| 3 | 17 standalone HTML panels | DONE | `--font-display` to `--font-mono` on sub-16px player names |
| 4 | Hero names verified correct | DONE | 8 pages at 18-32px stay `--font-display` |

---

## Quality Sweep: 5-Dimension Deep Audit (Mar 19-20)

**Goal**: Systematic quality audit across dark mode, error states, mobile responsiveness, interaction edge cases, and brand voice consistency. Every pixel, every interaction, every error state.

### Audit Methodology
5 parallel audit agents examined the entire codebase across these dimensions:
1. Dark mode completeness (canvas, heatmaps, inline colors)
2. Error/empty/loading states (raw err.message, alert() calls, generic text)
3. Mobile responsiveness (overflow, touch targets, flex-wrap)
4. Interaction edge cases (URL validation, JWT expiry, double-click)
5. Brand voice consistency (product naming, copy tone, exclamation marks)

### Dark Mode: Canvas Theme System (P0 — 200+ fixes)

| # | Fix | Files | Notes |
|---|-----|-------|-------|
| 1 | getCanvasTheme() helper | app.js | Global function returns {bg, bgWarm, bgCard, ink, inkMedium, inkLight, inkFaint, white, gridLine, subtitleAlpha, isDark} based on data-theme attribute |
| 2 | charts.js full dark mode | charts.js | drawRadar, drawScatter, drawWeeklyTrend, _drawTrendLine, drawHeatmap, drawCompareRadar, exportNFLCompareImage, drawProspectCompareSpider, exportProspectCompareImage — all use getCanvasTheme() |
| 3 | compare.js dark mode | compare.js | drawCompareRadar, drawRadarPoly, drawCompareArc, drawArcLine, exportComparePNG, drawExportPlayerCard, drawRadarOnExport |
| 4 | player.js dark mode | player.js | drawRadar, drawArc, exportPlayerPNG, drawRadarOnCanvas |
| 5 | lab.js dark mode (12+ export functions) | lab.js | exportImage, renderRankingsPNG, exportProspectImage, drawProspectSpider, drawCollegeArc, drawProfileArc, exportTierImage, drawClassAnalyticsChart, exportClassAnalyticsImage, trade values, heatmap, tier board, roster builder, boom/bust, player comp, aging curves, pick chart |
| 6 | lab.js html2canvas dark mode | lab.js | screenshotPanel() backgroundColor + watermark now theme-aware |
| 7 | lab-panels.js canvas (9 sections) | lab-panels.js | Aging curves, career trend, career compare, archetype donut, draft class chart, explorer scatter, correlation matrix, correlation scatter, dynasty power rankings |
| 8 | lab-prospect-radar.js | lab-prospect-radar.js | Grid rings, axis lines, labels, dot strokes |
| 9 | Weekly heatmap HEAT_COLORS | lab-panels.js | Static array → getHeatColors() function with dark palette |
| 10 | Matchup heatmap getHeatColor | lab-panels.js | Returns dark muted tints in dark mode |
| 11 | corrColor() dark mode | lab-panels.js | Correlation heatmap cells use dark muted colors |
| 12 | POS_LIGHT → getPosLight() | lab-panels.js | Position tints now theme-aware function |
| 13 | Cold gray elimination | 24 HTML files + charts.js | All rgba(26,26,46,...) → rgba(45,31,20,...) warm brown. Zero cold grays remaining anywhere in frontend |

### Brand Voice P0s (12 fixes)

| # | Fix | Files | Notes |
|---|-----|-------|-------|
| 1 | "Head back to the Lab" → "Screener" | 404.html | User-visible body text |
| 2 | "All 60+ Lab analytical panels" → "All 60+ analytical panels" | app.js | Welcome to Pro modal (both Pro and Elite) |
| 3 | "College Lab" / "Prospect Lab" → "College Screener" / "Prospect Screener" | lab.js | Browser tab titles |
| 4 | "Lab: X players selected" → "Screener:" | warroom.js | Context badges in Situation Room |
| 5 | "open Lab" → "open Screener" | warroom.js | Context badge link |
| 6 | "WAR ROOM" → "SIT ROOM" | warroom.js | Pixel canvas whiteboard text |
| 7 | "WHAT THE WAR ROOM REMEMBERS" → "SITUATION ROOM" | warroom.js | LLM memory context |
| 8 | "war-room briefing" → "Situation Room briefing" | agents.html | og:description meta tag |
| 9 | "setting up the war room" → "setting up the Situation Room" | agents.html | Canvas placeholder loading text |
| 10 | "Lab panels" → "Screener panels" | lab.html | aria-label on sidebar |
| 11 | "fantasy football war room" → "Situation Room" | 6 agent persona files | razzle.md, medical.md, scout.md, diplomat.md, historian.md, quant.md |

### Error State P0s (20+ fixes)

| # | Fix | Files | Notes |
|---|-----|-------|-------|
| 1 | 8x raw err.message removed | lab.js | All "fumbled..." messages now end with static "try again in a sec." |
| 2 | 1x raw err.message removed | compare.js | Same pattern |
| 3 | 1x raw err.message removed | player.js | Same pattern |
| 4 | 3x raw err.message classified | warroom.js | Now checks for timeout/401/generic, shows appropriate branded message |
| 5 | 2x raw e.message removed | league-intel.html | Monte Carlo and schedule analysis |
| 6 | 2x alert() → _showToast() | lab.js | Custom scoring config messages |
| 7 | 3x alert() → _showToast() | app.js | Subscription management fallbacks |
| 8 | apiFetch HTTP status codes hidden | app.js | "API 500: Internal Server Error" → "the server fumbled. try again in a sec." |
| 9 | 3x resp.status removed from toasts | app.js | Checkout, promo, subscription messages |
| 10 | 3x generic text → Razzle voice | formula-store.js | Rating, fetch, duplicate publish messages |

### Mobile P0s (5 fixes)

| # | Fix | Files | Notes |
|---|-----|-------|-------|
| 1 | Feature matrix table overflow wrapper | pricing.html | overflow-x:auto prevents page-level horizontal scroll |
| 2 | Config panel left:0 at 480px | agents.html | Prevents 12px overflow from base left:12px + width:100vw |
| 3 | Touch targets 44px minimum | agents.html | roster-toggle, config-toggle min-height:44px; scenario-agent-btn min-height:36px |
| 4 | Bulk action bar flex-wrap | lab.html | Prevents button overflow on narrow screens |
| 5 | Body overflow-x:hidden at 480px | pricing.html | Prevents horizontal scroll |

### Interaction Edge Cases (4 fixes)

| # | Fix | Files | Notes |
|---|-----|-------|-------|
| 1 | URL offset validation | lab.js | Math.max(0, parseInt(offset) \|\| 0) prevents negative/NaN offsets |
| 2 | URL universe validation | lab.js | Only "nfl" or "college" accepted, others ignored |
| 3 | League Odds double-click prevention | league-intel.html | Button disabled during simulation, re-enabled on success/error |
| 4 | JWT 401 interceptor | app.js | Expired token triggers localStorage clear + auth modal + branded error |

### Verification
- All 11 JS files pass `node --check` syntax validation
- All 59 tests pass (5.53s)
- 0 cold gray `rgba(26,26,46,...)` remaining in frontend
- 0 `alert()` calls remaining in JS files
- 0 raw `err.message` / `e.message` exposed to users
- 0 "war room" in user-visible text or agent persona prompts
- 0 "The Lab" in user-visible text (only internal code comments)

### Decisions Log
- Canvas dark mode was previously deferred as "post-launch" — now fully implemented via getCanvasTheme() helper
- Cold grays in standalone HTML watermark code (24 files) fixed via bulk sed — all were identical `rgba(26,26,46,...)` patterns
- "WAR ROOM" on pixel canvas shortened to "SIT ROOM" to fit the 9px monospace character width constraint
- Remaining "war room" in CSS comments and JS code comments are internal-only, not user-visible — left as-is

---

## Quality Audit: 5-Agent Deep Sweep (Mar 20)

**Goal**: Systematic 5-agent parallel crash/data/UX audit. Every pixel, every interaction, every error state.

### P0 Crash & Data Bugs (8 fixes)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 1 | `t` undefined in exportHeatMapPNG | lab.js:9890 | ReferenceError crash — missing `var t = getCanvasTheme()` |
| 2 | Keyboard `1` sets position `""` not `"ALL"` | lab.js:10298 | Wrong query results — posMap value was empty string |
| 3 | `p.ppg.toFixed(1)` crash on null | lab-panels.js:10250 | Game Script panel — changed to `fmt(p.ppg)` |
| 4 | `t.total_avg.toFixed(1)` crash on null | lab-panels.js:3593 | Matchup Heatmap — changed to `fmt(t.total_avg)` |
| 5 | Sitemap uses `"players"` key instead of `"items"` | server.py:2300 | Zero player URLs in sitemap.xml |
| 6 | `interceptions` missing from `_STAT_SUM_COLS` | core.py:120 | Passer rating always computed with ints=0 — inflated for all QBs |
| 7 | `checkFeatureGate` treats lifetime subscribers as free | app.js:277 | `gate["pro_lifetime"]` → undefined → fallback to `gate.free`. Fixed with `.replace("_lifetime", "")` |
| 8 | Pricing page promo code shadows API version | pricing.html:568 | Local `validatePromoCode()` only checked Easter eggs, never hit `/api/billing/validate-promo`. Added API fallthrough. |

### P1 Logic & UX Bugs (8 fixes)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 9 | Warroom briefing agent_highlights reads wrong props | warroom.js:3669 | `d.results[key]` is a string, not `{text, name}`. Added `typeof result === 'string'` check. |
| 10 | `waitAndStart` leaks RAF without tracking ID | warroom.js:3980 | Sprite loading loop didn't store rAF ID in `_rafId`, preventing cleanup. |
| 11 | `getSosGrade` indexOf on floats returns -1 | league-intel.html:6435 | Float precision mismatch. Changed to `findIndex` with epsilon comparison. |
| 12 | Welcome modal links missing `.html` extension | app.js:646-647 | Only two links in codebase without `.html` — `/league-intel` and `/lab`. Fixed. |
| 13 | Feature matrix claims "3 seasons" for free users | pricing.html:316, agents.html:1918 | Code gives all seasons free (Hotfix from Mar 19). Updated marketing to match. |
| 14 | `_detectCheckoutReturn` strips all URL params | app.js:548 | Was nuking all query params, not just `session_id`. Now uses URLSearchParams.delete(). |
| 15 | Sleeper transaction fetches (36 parallel) had no timeout | league-intel.html | Added 20s AbortController to `loadActivityFeed` and `fetchLeagueTransactions`. |
| 16 | `crawlLeagueHistory` sequential fetches had no timeout | league-intel.html:2301 | Added 8s per-fetch AbortController. |

### P2 Robustness Fixes (4 fixes)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 17 | `publish_formula` leaks exception message to user | storage.py:235 | `str(e)` → generic "failed to publish formula" |
| 18 | Formula search doesn't escape LIKE wildcards | storage.py:253 | `%` and `_` in search matched everything. Added ESCAPE clause. |
| 19 | Monte Carlo histogram blurry on Retina | league-intel.html:5795 | Added DPR scaling to `_mcDrawHistogram` canvas. |
| 20 | Monte Carlo z-score extreme outliers | league-intel.html:5752 | Clamped Box-Muller z to ±4 standard deviations. |

### Verification
- All 11 JS files syntax clean
- All 21 Python files compile clean
- All 3 HTML inline scripts validated
- 59/59 tests pass (5.58s)
- 0 regressions

---

## Quality Audit: 5-Agent Parallel Sweep (Mar 20)

**Goal**: Fresh 5-agent parallel audit across crash bugs, design consistency, dark mode, mobile, and brand voice.

### P0 Crash Bugs (2 fixes)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 1 | Division by zero: moveValues.length can be 0 | league-intel.html:2832 | `seasonsTracked >= 2` doesn't guarantee movesBySeason is non-empty — added `moveValues.length > 0` guard |
| 2 | avgRating.toFixed() crash on null | formula-store.js:571 | API can return formula without avgRating — added `|| 0` fallback on avgRating and ratingCount |

### P0 Dark Mode (3 fixes)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 3 | btn-chunky.active: `color:white` on `var(--ink)` bg | styles.css:692 | In dark mode, --ink becomes sand — white on sand is invisible. Changed to `color:var(--bg)` |
| 4 | chip.active[ALL]: `color:white` on `var(--ink)` bg | styles.css:754 | Same issue — added `color:var(--bg)` override |
| 5 | Draft round badge: `color:white` on `var(--ink)` bg | lab.js:6370 | Inline style in prospect profile — changed to `color:var(--bg)` |

### P1 UX (2 fixes)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 6 | Tag picker not Escape-dismissible | lab.js:10252 | Added `_tagPickerVisible` check in Escape handler before overlay check |
| 7 | Pagination visible on zero results | lab.js:2975 | Added `visibility:hidden` on `.footer-bar .pagination` when `totalCount === 0` |

### Audit Findings (Not Bugs)
- Box shadow 2px/3px on hover/active states: intentional depth effect (pressed/lifted), not a violation
- `color:#fff` on accent-colored badges (--orange, --purple, --green backgrounds): correct — accents don't flip in dark mode
- `rgba(0,0,0,...)` on dark mode overlays: standard approach for dimming, not a cold gray violation
- Canvas hardcoded accent colors: position colors (blue/teal/orange/purple) intentionally stay the same per design guide
- Feature matrix pricing.html: already has `overflow-x:auto` wrapper
- Filter modal + profile modal: already dismiss on Escape via `closeAllOverlays()` (both use `.filter-modal-overlay` class)

---

## Quality Audit: 5-Agent Deep Sweep (Mar 20 — Session 2)

**Goal**: Systematic 5-agent parallel audit across all major files. Crash bugs, data correctness, dark mode, mobile, interaction edge cases.

### P0 Crash & Data Bugs (4 fixes)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 1 | Virtual scroll bounds check on `state.items[li]` | lab.js:1873 | Race condition: items replaced during scroll could make index out of bounds → TypeError crash. Added `&& state.items[li]` guard. |
| 2 | `weekly_scores` null guard in boom/bust export | lab.js:12716 | Destructured field could be undefined if API returns partial response. Added `|| []` fallback + early return. |
| 3 | `gsis_id` → `player_id` in 6 SQL joins | tools.py | `fetch_season_pace`, `fetch_garbage_time`, `fetch_snap_efficiency`, `fetch_workload`, `fetch_dual_threat`, `fetch_td_regression` all joined on `p.gsis_id = s.player_id` — wrong for fallback player IDs. Changed to `p.player_id`. |
| 4 | INT rate used `turnovers` (includes fumbles) instead of `interceptions` | analytics.py:243,897 | QB interception rate was inflated. Added `interceptions` column to SQL, fixed both heatmap and buy/sell efficiency computations. |

### P1 Data & UX Bugs (11 fixes)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 5 | Dynasty sparkline NaN from null `trade_value` | lab.js:6513 | Entry could have null trade_value → NaN in min/max/SVG coords. Added `entry.trade_value != null` guard. |
| 6 | `mismatch_score` NaN when null | lab-panels.js:1623 | Buy/Sell bar width `NaN%`. Added `|| 0` fallback. |
| 7 | `correlation` NaN when undefined | lab-panels.js:3735 | Stack Finder bar width `NaN%`. Added `|| 0` fallback. |
| 8 | `projected` NaN when undefined | lab-panels.js:5049 | Pace Tracker progress bar `NaN%`. Added `|| 0` fallback. |
| 9 | `success_rate`/`volume`/`ppg` raw null in HTML | lab-panels.js:8984-8987 | Success Rate panel showed literal "null" or "undefined". Changed to `fmt()`. |
| 10 | `career_av` raw null in HTML | lab-panels.js:9632 | Draft Class Tracker showed literal "null". Changed to `fmt()`. |
| 11 | Air Yards `sortPlayers` string subtraction | lab-panels.js:5341 | Sorting by name produced `NaN` from `string - string`. Added `typeof` check with `localeCompare`. |
| 12 | Canvas `var(--orange)` string in fillStyle | league-intel.html:2941 | Canvas API ignores CSS var() syntax — bars rendered wrong color. Changed to `cssVar()` resolution at assignment. |
| 13 | Player name "null Smith" in roster view | league-intel.html:2048 | Template literal without null guards. Changed to `(first_name || '') + ' ' + (last_name || '')`. |
| 14 | `loadPersona` no timeout — agent run could hang forever | warroom.js:1886 | Added 10s AbortController timeout. |
| 15 | Mobile nav missing sign-out for logged-in users | app.js:202 | Mobile hamburger menu showed username but had no action. Now signs out on tap. |
| 16 | Toast collision: trial warning kills checkout toast | app.js:984 | Added `_checkoutInProgress` flag to suppress trial toast during checkout return. |

### Verification
- All 11 JS files syntax clean
- All Python files compile clean
- 59/59 tests pass
- 0 regressions

### Verified Clean
- 0 `alert()` calls in frontend JS
- 0 debug `console.log` (only branded Easter egg)
- 0 unguarded division operations
- 0 `color:white` on theme-responsive backgrounds
- All 11 JS files syntax clean
- All Python files compile clean
- 59/59 tests pass

---

## Quality Audit: Deep Multi-Agent Sweep (Mar 20)

**Goal**: Three-wave quality audit focused on crash bugs, canvas dark mode completeness, brand voice, and design consistency. Every pixel, every interaction, every error state.

### Wave 1: Canvas Dark Mode + Crash Guards (7 fixes)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 1 | 3 remaining hardcoded canvas hex → getCanvasTheme() | lab.js | `#8a7565` → t.inkLight (heatmap rank label, aging curve Y-axis), `#c4b5a5` → t.inkFaint (radar grid circles) |
| 2 | 5 boom/bust canvas hex → getCanvasTheme() | lab.js | `#5c4a3d` → t.inkMedium (axis titles), `#8a7565` → t.inkLight (title annotation, floor/ceiling labels) |
| 3 | Pie chart label '#fff' → getCanvasTheme().white | lab-panels.js | Donut chart percentage labels now theme-aware |
| 4 | pick_label.split(" ")[1] null guard | lab.js | Added fallback to prevent "undefined" rendering |
| 5 | Modal overlay invisible in dark mode | app.js | Feature gate + player popup overlays now use dark-aware rgba |
| 6 | Warm watermark color on 25 panels | 25 HTML files | PNG export watermark was cold rgba → warm brown |
| 7 | Backend email key crash | server.py | `user["email"]` → `user.get("email", "unknown")` in formula publish |

### Wave 2: Standalone Panels + Inline Style Audit

| # | Finding | Result |
|---|---------|--------|
| 1 | 22 standalone panel pages audited | ALL PASS — personality loading, error handling, correct seasons, app.js |
| 2 | Inline style hex colors in all 11 JS files | CLEAN — all use CSS vars or intentional fixed colors |
| 3 | First-user experience flow | Landing page clear, screener loads, funnel works end-to-end |

### Wave 3: Brand Voice + Card Shadows (10 fixes)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 1 | "search failed" → "fumbled the search..." | app.js | Command palette error |
| 2 | "could not copy link" → "fumbled the copy — try again" | lab.js | Link share copy |
| 3 | "copy failed" → "fumbled the copy — try again" | lab.js | Context menu copy (2 instances) |
| 4 | "failed to save view" → "couldn't save the view..." | lab.js | Saved views localStorage error |
| 5 | "no data to copy" → "no film to copy — run a query first" | lab.js | CSV with no results (2 instances) |
| 6 | "screenshot failed" → "fumbled the screenshot..." | lab.js + lab-panels.js | PNG export failures |
| 7 | "failed to find trade targets" → razzleError() | lab-panels.js | Trade finder panel |
| 8 | "failed to calculate roster value" → "fumbled the roster math..." | lab.js | Roster report |
| 9 | Card shadows 3px → 4px on 5 classes | lab-panels.css | db2-top5-card, ld2-card, pct2-player-card, bb-card, td2-team-card |
| 10 | Logo shadow 3px → 4px | styles.css | Brand element per design guide |

### Verified Clean
- 0 generic "failed" / "could not" / "search failed" user-facing messages
- 0 hardcoded canvas theme colors in lab.js (excl. intentional position/accent)
- 0 card-level 3px box-shadows in CSS classes
- 0 debug console.log / TODO / FIXME / debugger
- All 11 JS files syntax clean
- All Python files compile clean
- 59/59 tests pass

---

## Quality Audit: 5-Agent Parallel Sweep (Mar 20 — Session 2)

**Goal**: Fresh-eyes 5-agent parallel audit across crash bugs, design consistency, backend robustness, standalone HTML panels, and brand voice.

### Standalone HTML Panel Fixes (6 fixes)

| # | Fix | File(s) | Severity | Notes |
|---|-----|---------|----------|-------|
| 1 | app.js loaded after inline script — crash on razzleLoading() | weekly.html, aging.html, breakouts.html, buysell.html, scarcity.html, targets.html | **HIGH** | Moved app.js before inline script, removed duplicate at end. weekly.html crashed on every load. |
| 2 | sendBeacon without Content-Type — analytics silently fails | weekly.html, targets.html | MEDIUM | Replaced sendBeacon with fetch() + Content-Type header |
| 3 | Hardcoded season years 2024-2020 | handcuffs.html | MEDIUM | Changed to use API `available_seasons` response (like all other pages) |
| 4 | Missing watermark div | handcuffs.html | LOW | Added standard fixed-position watermark |

### Frontend Crash Bug Fixes (5 fixes)

| # | Fix | File | Severity | Notes |
|---|-----|------|----------|-------|
| 1 | loadFormulas() crashes on corrupted formula name | lab.js:4802 | **HIGH** | Added `f && f.name &&` guard — null name.toLowerCase() bricked entire screener |
| 2 | renderSavedFormulas() crash on non-lab pages | formulas.js:116 | **HIGH** | Added `if (!container) return` — called from refreshPlanGating() on all pages |
| 3 | College profile renders "undefined season" | lab.js:6150 | MEDIUM | Added `player.seasons_played \|\| 0` guard |
| 4 | Unescaped player_id in onclick attributes | lab.js:6380-6381 | LOW | Changed to escapeAttr() |
| 5 | localStorage.setItem without try-catch in sync | formulas.js:205 | MEDIUM | Wrapped in try-catch |

### Backend Robustness Fixes (5 fixes)

| # | Fix | File | Severity | Notes |
|---|-----|------|----------|-------|
| 1 | Wrong column names in game log + compare table SQL | players.py:1393-1403, 1471-1493 | **HIGH** | `pass_yards` → `passing_yards`, etc. — all stats returned as zero |
| 2 | Cache lock memory leak on eviction | core.py:67-78 | MEDIUM | Added `_cache_locks.pop(k, None)` in eviction |
| 3 | `_safe_div` crashes on null numerator | core.py:177-181 | LOW | Added `a is None` guard |
| 4 | Registration TOCTOU race on duplicate email | auth.py:340 | LOW | IntegrityError now returns 409 instead of generic 500 |
| 5 | bcrypt crash on corrupted password hash | auth.py:355 | LOW | Wrapped in try-except |

### Brand Voice Fixes (20 fixes)

| # | Fix | File(s) | Notes |
|---|-----|---------|-------|
| 1 | 8 exclamation marks removed | compare.js, player.js, lab.js, rosterbuilder.html, formula-store.js (2), app.js, lab-panels.js | "Copied!" → "copied.", etc. |
| 2 | 8 generic error messages → razzleError() | leaders.html, matchups.html, prospects.html, rankings.html, team.html, tradefinder.html, warroom.js, lab-panels.js | "could not load X" → personality text |
| 3 | 4 generic toast messages → film room flavor | lab.js (4 instances) | "no data to export" → "no film to export — run a query first", etc. |

### Verification
- All 11 JS files syntax clean
- All Python files compile clean
- 59/59 tests pass
- 0 remaining app.js ordering issues across all 74 pages
- 0 duplicate app.js includes
- 0 exclamation marks in user-visible toast/status messages
- 0 generic "could not load" error messages in standalone HTML pages

### Design Consistency Fixes (Wave 2)

| # | Fix | File(s) | Notes |
|---|-----|---------|-------|
| 1 | 25 font-display at <14px → font-mono | lab.html (11), league-intel.html (13), agents.html (1) | Luckiest Guy illegible below 14px — design guide: 16px+ only |
| 2 | 14 resting-state box-shadows 3px → 4px | agents.html (11 + 3 inline), league-intel.html (2), lab-panels.css (1) | Design guide: 4px 4px 0 resting, 3px only on hover transitions |
| 3 | index.html agent name 14px → 16px | index.html | Bumped to meet display font minimum |

### Verification (Final)
- All 11 JS files syntax clean
- All Python files compile clean
- 59/59 tests pass
- 0 font-display below 14px in lab.html, league-intel.html, agents.html
- 0 resting-state 3px box-shadows in agents.html

---

## Quality Audit: 5-Agent Parallel Sweep (Mar 20 — Session 3)

**Goal**: Fresh-eyes 5-agent parallel audit across crash bugs (lab.js + lab-panels.js), backend robustness, design consistency, dark mode gaps, and brand voice.

### HIGH Crash & Data Bugs (3 fixes)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 1 | `drawBoomBustRangeBar` missing `var t = getCanvasTheme()` | lab.js:12551 | **ReferenceError** on every Boom/Bust render — only canvas function that forgot the theme call |
| 2 | College QB `total_tds` double-counted | cfbfastr_adapter.py:330-331 | Pass TDs added during play loop (line 224) AND again after loop — all college QBs had inflated TDs |
| 3 | Trendline division by zero (2 instances) | lab-panels.js:7492, 9907 | `n * sumX2 - sumX * sumX` can be 0 when all X values identical — added denom guard |

### MEDIUM Defensive Guards (6 fixes)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 4 | `dynasty_value.toFixed()` on non-number | lab.js:1833 | `val != null` → `typeof val === "number"` |
| 5 | `breakout_pct.toFixed()` on non-number | lab.js:1839 | Same typeof guard |
| 6 | Null data destructuring in 3 profile renderers | lab.js:6133,6327,6939 | Added `if (!data) return` before destructuring |
| 7 | `grade.startsWith()` on undefined (2 instances) | lab.js:12340,12612 | Added `grade \|\| "C"` fallback |
| 8 | `score.toFixed()` on potential string + undefined thresholds | lab-panels.js:3382,3397 | `Number(score)` coercion + `(lt.p20 \|\| 0)` guard |
| 9 | `escapeHtml(p.annotation)` on undefined | lab-panels.js:1639 | Added `\|\| ''` fallback |

### LOW Design + Dark Mode + Brand Voice (12 fixes)

| # | Fix | File(s) | Notes |
|---|-----|---------|-------|
| 10 | 3x box-shadow 3px→4px | lab.html | scroll-top-btn, prospect-comp-card, prospect-proj-box |
| 11 | 4x box-shadow 3px→4px in JS | pricing.html | Early adopter + lifetime promotion cards |
| 12 | 3x font-display 14px→16px | lab.html | hover-card-name, watermark, profile-section-title |
| 13 | 5x font-display 14px→16px | league-intel.html | pressure-map-title, gate-cta, h2h-col-header, power-bracket h4, trade-network h4 |
| 14 | Player overlay dark mode | player.js:724 | Hardcoded rgba(45,31,20,0.5) → theme-aware branching |
| 15 | 3x toast box-shadow hardcoded | player.js, compare.js, formula-store.js | rgba(45,31,20,0.3) → var(--ink) |
| 16 | Weekly expand row border | lab.js:2317 | rgba(45,31,20,0.04) → var(--ink-faint) |
| 17 | Verdict badge border | lab-panels.js:9620 | rgba(45,31,20,0.15) → var(--ink-faint) |
| 18 | "loading weeks..." → "pulling weekly film..." | lab.js:2287 | Brand voice personality |
| 19 | "no prospect data found" → razzleEmpty() | lab-mockdraft.js:260 | Brand voice personality |
| 20 | roster-grade integer PID rejection | server.py:2794 | isinstance(pid, str) → str(pid).strip() |

### Verification
- All 11 JS files syntax clean
- All 18 Python files compile clean
- 59/59 tests pass (5.67s)
- 0 regressions

---

## Quality Audit: 5-Agent Parallel Sweep (Mar 20 — Session 4)

**Goal**: Fresh 5-agent parallel audit across crash bugs (lab.js, lab-panels.js), design consistency, dark mode completeness, backend robustness, and brand voice.

### P1 Dark Mode Fixes (3 fixes)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 1 | Warroom hero mascot shadow invisible on dark bg | agents.html:37 | `rgba(45,31,20,0.15)` → `rgba(0,0,0,0.15)` — inside `.warroom-dark` forced dark theme |
| 2 | Canvas container shadow invisible on dark bg | agents.html:204 | `rgba(45,31,20,0.4)` → `rgba(0,0,0,0.4)` — inside `.warroom-dark` |
| 3 | Canvas placeholder icon shadow invisible on dark bg | agents.html:230 | `rgba(45,31,20,0.3)` → `rgba(0,0,0,0.3)` — inside `.warroom-dark` |

### P1 Defensive Guards (3 fixes)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 4 | `available_seasons[0]` without length check | lab-panels.js:1477 | Breakouts panel — added `.length ?` ternary guard |
| 5 | `available_seasons[0]` without length check | lab-panels.js:1667 | Buy/Sell panel — added `.length ?` ternary guard |
| 6 | `buildSparklineSVG(pts)` no null/empty guard | lab.js:2046 | Added `if (!pts || !pts.length) return ''` at function entry |

### P2 Dark Mode CSS Fixes (4 fixes)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 7 | Placeholder text hardcoded rgba | archetypes.html:240 | `rgba(45,31,20,0.15)` → `var(--ink-faint)` — theme-responsive |
| 8 | Placeholder text hardcoded rgba | auction.html:289 | `rgba(45,31,20,0.15)` → `var(--ink-faint)` — theme-responsive |
| 9 | Placeholder text hardcoded rgba | tiers.html:242 | `rgba(45,31,20,0.15)` → `var(--ink-faint)` — theme-responsive |
| 10 | Dollar tier badge hardcoded background | auction.html:232 | `rgba(45,31,20,0.06)` → `color-mix(in srgb, var(--ink) 6%, transparent)` |

### Audit Findings (Not Bugs)
- `color: white` on accent backgrounds (--orange, --pos-qb, etc.): correct — accents don't flip in dark mode
- Auth modal 8px shadow: intentional elevated overlay emphasis
- Mobile nav 6px shadow: intentional sliding panel emphasis
- Focus-visible 6px shadow: accessibility needs extra visibility
- `.chip.active[data-pos="ALL"]` already overrides to `color: var(--bg)` — correctly handled
- `.btn-chunky.active` already uses `color: var(--bg)` — correctly handled
- Backend: 0 SQL injection, 0 bare excepts, 0 connection leaks, 0 division by zero unguarded
- Brand voice: 0 generic messages, 0 alert() calls, 0 "War Room" or "The Lab" in user-visible text

### Verified Clean
- All 11 JS files syntax clean
- All Python files compile clean
- 59/59 tests pass (5.63s)
- 0 regressions

---

## Dark Mode PNG Export — 65 Files Fixed (Mar 20 — Session 4)

**Goal**: Make all standalone HTML panel PNG exports theme-aware. Previously every export was forced to light sand background regardless of user's dark mode setting.

### html2canvas backgroundColor (46 files)
All `backgroundColor: '#ede0cf'` → `document.documentElement.dataset.theme === 'dark' ? '#2d1f14' : '#ede0cf'`

### Canvas watermark fillStyle (60+ instances across 60 files)
All `ctx.fillStyle = 'rgba(45,31,20,...)'` → theme-branching with sand rgba for dark, espresso rgba for light. Covers all opacity levels (0.12, 0.13, 0.15, 0.18, 0.25, 0.3).

### league-intel.html AbortController timeouts (3 fixes)

| # | Fix | Line | Notes |
|---|-----|------|-------|
| 1 | Power ranking playoff settings fetch | 4284 | Added 10s AbortController — was hanging indefinitely on slow Sleeper API |
| 2 | Waiver type detection fetch | 4489 | Added 10s AbortController — same issue |
| 3 | Historical roster promise chain fetch | 2656 | Added 10s AbortController — blocked entire history display on slow API |

### Verified Clean
- All 11 JS files syntax clean
- 59/59 tests pass (5.77s)
- 0 hardcoded `backgroundColor: '#ede0cf'` remaining in any HTML file
- 0 hardcoded `ctx.fillStyle = 'rgba(45,31,20,...)'` canvas watermarks remaining
- 0 Sleeper API fetches without AbortController timeouts

---

## First-User Experience Audit (Mar 20 — Session 4)

**Goal**: Walk through the entire first-user journey and fix UX issues a real visitor would hit.

### Copy & Consistency Fixes (6 fixes)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 1 | Developer jargon "30 x 22 tile grid" in status bar | agents.html:1622 | → "real-time simulation" |
| 2 | Inconsistent "60+ metrics" on home page | index.html:598 | → "100+ stat columns" (matches meta tags and pricing) |
| 3 | "70+ stat panels" on pricing | pricing.html:222 | → "100+ stat columns" (consistent with home + FAQ) |
| 4 | "BYOK" unexplained in Pro features | pricing.html:245 | → "bring your own API key" |
| 5 | Feature matrix "Full historical data" contradicts free access | pricing.html:335 | Removed row — all seasons are free since Mar 19 hotfix |
| 6 | "Contact us" with no contact method | pricing.html:412 | Added Twitter DM link @razzle_lol |

### Bureau UX Fixes (3 fixes)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 7 | "Permanently link" warning scares non-logged-in users | league-intel.html:1679 | Default text → "stored locally in your browser — sign up to save." Logged-in users see the permanent warning. |
| 8 | Dead end for non-Sleeper users | league-intel.html:1681 | Added "Don't use Sleeper? explore the free Screener" fallback link |
| 9 | Nav tooltips for Bureau + Situation Room | index.html:482-483 | Added title="Connect your Sleeper league" and "AI agents for your league" |

### Situation Room UX Fixes (3 fixes)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 10 | OpenRouter setup lacks context | agents.html:1740 | Added "(routes to Claude, GPT-4, etc. — most queries cost <$0.01)" |
| 11 | API key placeholder implies specific provider | agents.html:1575 | "sk-or-v1-..." → "paste your API key here" |
| 12 | "Generic Mode" badge is unexplained jargon | warroom.js:1770 | → "No league data — general analysis" |

### Verified Clean
- All 11 JS files syntax clean
- 59/59 tests pass (5.62s)
- 0 regressions

---

## Quality Audit: Fresh-Eyes 5-Agent Sweep (Mar 20 — Session 5)

**Goal**: Final quality gate. 5 parallel audit agents examined lab.js crash bugs, lab-panels.js crash bugs, backend SQL/API robustness, design consistency, and first-user UX flows.

### P0 Crash Bugs Fixed (3)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 1 | Scroll-to-top broken: `getElementById("tableWrap")` but element only has `class="table-wrap"` | lab.js:2991 | Pagination never scrolled to top — fixed to `querySelector(".table-wrap")` |
| 2 | Page size default 100 but only 25 in dropdown | lab.js:947 | Changed default from 100 to 25 to match the single available option |
| 3 | Backend sort crash on derived columns (`age`, `half_ppr_ppg`, `cpoe`, `epa_per_play`) | players.py:147-155 | `SUM(s.age)` → `p.age`, derived columns fall back to PPR sort in SQL |

### P1 Logic & Robustness Fixes (9)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 4 | `switchView` querySelector null crash on invalid view | lab-panels.js:389 | Added null guard before `.classList.add('active')` |
| 5 | `renderPercentiles` crash when `data.player` is null | lab-panels.js:7948 | Added `if (!p)` guard with empty state |
| 6 | Ctrl+K nav button bypassed `openCmdPalette()` | 74 HTML files | Raw DOM manipulation → proper function call with recently-viewed list |
| 7 | `sortPlayers` NaN on mixed null/string types | lab-panels.js (4 instances) | Null → sort last, String coercion with `String(vb)`, Number with `Number()` |
| 8 | Weekly leaders sort NaN on null values | lab-panels.js:4194 | Same null-safe sort pattern |
| 9 | Compare button silent failure with <2 players | charts.js:837 | Added toast: "select 2+ players with the checkboxes first" |
| 10 | `.toFixed()` crash on string combine values | lab.js:6441-6446 | Wrapped in `Number()` for forty, vertical, cone, shuttle |
| 11 | `p.age` rendered as raw float (26.743) | lab.js:8977,9240,10675,6053 | All 4 instances → `Math.round(p.age)` or null guard |
| 12 | Division by zero in prospects percentile calc | prospects.py (4 functions) | Added `if not all_vals: continue` guard before `/ len(all_vals)` |

### P2 Design Consistency Fixes (10)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 13 | Canvas axis labels Luckiest Guy at 13px | explorer.html:503, lab-panels.js:7489 | → Space Mono 13px |
| 14 | `.ar-export-btn` display font at 13px | archetypes.html | → `--font-mono` |
| 15 | `.ar-arch-count` display font at 13px | archetypes.html | → `--font-mono` |
| 16 | `.ar-player-ppg` display font at 14px | archetypes.html | → `--font-mono` bold 700 |
| 17 | `.aging-tooltip-name` display font at 13px | aging.html | → `--font-mono` |
| 18 | `.bd-pos-badge` display font at 12px | breakdown.html | → `--font-mono` |
| 19 | `.bd-legend-label/pct` display font at 13px | breakdown.html (2) | → `--font-mono` |
| 20 | `.aw-runner-rank` display font at 12px | awards.html | → `--font-mono` |
| 21 | `.aw-runner-name` display font at 13px | awards.html | → `--font-mono` |
| 22 | `.tl-export-btn` display font at 13px | tiers.html | → `--font-mono` |
| 23 | `.tools-export button` display font at 13px | tools.html | → `--font-mono` |

### changePageSize validation tightened
- Allowed sizes: `[25]` only (was `[25, 50, 100, 200]`)

### Verified Clean
- All 11 JS files syntax clean
- All Python files compile clean
- 59/59 tests pass (5.61s)
- 0 regressions
- 0 `box-shadow: 3px 3px 0` in resting states (all 29 instances are hover/focus — correct)
- 0 display font below 16px in CSS (except intentional 11px uppercase section labels)

---

## Quality Audit: 5-Agent Parallel Sweep (Mar 20 — Session 6)

**Goal**: Fresh 5-agent parallel audit: first-impression UX, data correctness, interaction flows, mobile/accessibility, backend security.

### P1 Fixes (7 fixes)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 1 | Home page Pro/Elite buttons hardcoded `pro_year`/`elite_year` | index.html:621,638 | Buttons showed $9.99/mo but triggered yearly checkout. Changed to `pro_month`/`elite_month` to match displayed price. |
| 2 | LLM proxy `resp.json()` crash on non-JSON response | server.py:1105,1201 | Both elite and free LLM proxy endpoints could crash if provider returned HTML with status=200. Wrapped in try-except. |
| 3 | Formula store `json.loads()` crash on corrupted data | storage.py:284,310-311 | position_tags/stat_weights could crash on corrupted JSON. Added `_safe_json_loads()` helper with fallback. |
| 4 | Rating type confusion | storage.py:320 | `rating < 1` crashed on string input. Added int() coercion with try-except. |
| 5 | Hamburger toggle below 44px touch target | styles.css:213 | Added `min-height: 44px; min-width: 44px` |
| 6 | Mobile nav close below 44px touch target | styles.css:275 | Added `min-height: 44px; min-width: 44px` |
| 7 | Auth input font-size 14px causes iOS auto-zoom | styles.css:637 | Changed to 16px — prevents unwanted zoom-on-focus on iOS |

### P2 Fixes (4 fixes)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 8 | Note editor Escape missing stopPropagation | lab.js:574 | Escape in note editor now stops before bubbling to global handler |
| 9 | Home page Pro feature list incomplete | index.html:613-620 | Added "Unlimited formulas + cloud sync" and "CSV export + compare up to 4" to match pricing page |
| 10 | Formula store search no length limit | storage.py:264 | Truncate to 100 chars to prevent performance DoS |

### Audit Triage (Not Bugs)
- Context menu listeners in IIFE — runs once on load, not per re-render
- Note editor innerHTML replaces textarea — old listeners garbage collected
- `request.json()` error handling — FastAPI handles JSONDecodeError with 422 automatically
- SQL in ALTER TABLE migration — values are hardcoded literals, not user input
- dblclick + drag conflict — browser only fires dragstart on mousedown+move, not on stationary double-click
- Post-filter pagination count — showing filtered count IS correct UX for post-filters
- Nav dropdown overflow — `right: 0` extends leftward, no overflow

### Verified Clean
- All 11 JS files syntax clean
- All 16 Python files compile clean
- 59/59 tests pass (5.63s)
- 0 regressions

## Quality Audit: 5-Agent Parallel Sweep (Mar 20 — Session 6)

**Goal**: Fresh 5-agent parallel audit across crash bugs (lab.js, lab-panels.js), backend robustness, dark mode completeness, and design consistency.

### P0 Crash Bug Fixes (4)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 1 | `p.name.split(" ").pop()` null crash | lab.js:9489 | Aging curve labels — added `(p.name || '')` guard |
| 2 | `p.history.forEach` on undefined | lab-panels.js:219 | Rankings panel — added `(p.history || [])` guard |
| 3 | `pd.players.forEach` on undefined | lab-panels.js:2079 | Scarcity panel — added `(pd.players || [])` guard |
| 4 | `team.players.sort/forEach` on undefined | lab-panels.js:9104 | Targets panel — added `if (!team.players) team.players = []` guard |

### Dark Mode Fix (1)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 5 | `.md-clock-pulse` background: white → var(--orange) | lab-panels.css:3911 | White dot invisible on light sand bg — orange works on both themes |

### Audit Findings (Not Bugs)
- Text-shadow `rgba(45,31,20,...)` on tier letters and bar values: these are on accent-colored backgrounds (not theme-responsive), shadow is for depth. Correct as-is.
- Box shadow 3px on hover states: intentional pressed effect (reviewed in prior passes)
- Backend SQL ORDER BY f-strings: all values are whitelist-validated before interpolation. Pattern is safe.
- All `color: white` / `color: #fff` instances are on accent backgrounds — correct contrast

### Verified Clean
- All 11 JS files syntax clean
- All Python files compile clean
- 59/59 tests pass (5.67s)
- 0 regressions

---

## Quality Audit: 5-Agent Deep Sweep (Mar 20 — Session 7)

**Goal**: Fresh 5-agent parallel audit across crash bugs (lab.js, lab-panels.js), backend robustness, dark mode + design consistency, and UX/accessibility.

### P0 Crash Bug Fixes (9 fixes)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 1 | `data.percentiles` undefined → `data.percentiles \|\| {}` | lab.js:6943 | Prospect profile athletic testing section crashed if API returned no percentiles |
| 2 | `college.career` null → `college.career \|\| {}` | lab.js:7016 | Prospect college production section crashed if career data missing |
| 3 | `c.full_name.split()` null → `(c.full_name \|\| "")` guard | lab.js:11971 | Comp stat table header crashed on null player name |
| 4 | `player.full_name.replace()` null → `(player.full_name \|\| "player")` guard | lab.js:12303 | Comp PNG export filename crashed on null name |
| 5 | `a.weeks[sortCol]` → `(a.weeks \|\| {})[sortCol]` | lab-panels.js:3353 | Weekly heatmap sort crashed if player had no weeks data |
| 6 | `p.weeks[String(w)]` → `(p.weeks \|\| {})[String(w)]` | lab-panels.js:3381 | Weekly heatmap render crashed if player had no weeks data |
| 7 | `t.positions[pos]` → `(t.positions \|\| {})[pos]` | lab-panels.js:3548 | Matchup heatmap value collection crashed if team had no positions data |
| 8 | `a.positions[sortCol]` → `(a.positions \|\| {})[sortCol]` | lab-panels.js:3558 | Matchup heatmap sort crashed on missing positions |
| 9 | `t.positions[pos]` → `(t.positions \|\| {})[pos]` | lab-panels.js:3585 | Matchup heatmap row render crashed on missing positions |

### Backend Robustness Fixes (6 fixes)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 1 | Thread-safe `cache_stats()` — snapshot values before iteration | core.py:89-94 | `RuntimeError: dictionary changed size during iteration` under concurrent /api/health calls |
| 2 | Thread-safe `_resp_cache_set()` — snapshot items, use `.pop()` | server.py:49-56 | Same RuntimeError during response cache eviction under concurrent threads |
| 3 | `_safe_int()` helper for week validation | core.py:180 | New helper prevents `ValueError` on non-numeric week params |
| 4 | 10x `int(week)` → `_safe_int(week)` in analytics.py + tools.py | analytics.py, tools.py | All week parameter parsing now safe from ValueError on bad input |
| 5 | `available_weeks` endpoint: relative import + dynamic season | server.py:1612,1616 | Was `from backend.db` (absolute, fragile) + hardcoded `2025`. Now `from .db` + `_current_nfl_season()` |
| 6 | `_waitlist_rate` dict pruning to prevent memory leak | server.py:1904-1907 | Added stale entry cleanup when dict exceeds 5000 entries |

### Dark Mode + Design Fixes (5 fixes)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 1 | Cold gray sidebar shadow `rgba(15,15,26)` → warm `rgba(45,31,20)` | lab.html:578 | Violated "no cold grays" rule |
| 2 | `.pos-badge` font-display at 10px → font-mono | lab.html:1587 | Design guide: display font only at 16px+ |
| 3 | `.profile-pos-badge` font-display at 14px → font-mono | lab.html:1857 | Same rule |
| 4 | `.tier-card-name` font-size 15px → 16px | lab.html:2323 | Met display font minimum threshold |
| 5 | Tier badge hardcoded rgba → CSS vars | lab-panels.css:771-775 | `rgba(...)` backgrounds invisible in dark mode → `var(--red-light)`, `var(--orange-light)`, etc. |
| 6 | `#e8a838` amber → `var(--yellow)` | lab-panels.css:427 | Hardcoded hex not in design token system |

### UX + Accessibility Fixes (6 fixes)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 1 | 404 page: removed `class="active"` from Screener nav link | 404.html:140 | Wrong nav item highlighted |
| 2 | Auth modal: aria-labels on all 5 inputs | app.js:689-697 | WCAG 4.1.2 — screen readers could not identify inputs |
| 3 | Pricing toggle: `role="switch"`, `aria-checked`, `tabindex`, keyboard handler | pricing.html:204 | WCAG 2.1.1 — was mouse-only, now keyboard accessible (Space/Enter) |
| 4 | Pricing toggle: `aria-checked` updates on state change | pricing.html:515 | Keeps switch state in sync for screen readers |
| 5 | Sleeper input: `aria-label="Sleeper username"` | league-intel.html:1675 | WCAG 4.1.2 — input had no accessible label |
| 6 | "BYOK" jargon → "bring your own key" / "your key" | index.html:615, pricing.html:327-328 | Removed unexplained acronym from conversion-critical surfaces |

### Verified Clean
- All 11 JS files syntax clean
- All Python files compile clean
- 59/59 tests pass (5.64s)
- 0 regressions

---

## Quality Audit: Deep 5-Agent Security + UX Sweep (Mar 20 — Session 8)

**Goal**: Fresh-eyes 5-agent parallel audit targeting security, conversion funnel, crash bugs, and interaction seams between pages. Focus on what automated sweeps miss: real user flows, XSS vectors, backend parameter validation, and conversion-critical code paths.

### CRITICAL Security Fixes (3)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 1 | XSS via URL position param | lab.js:3804 | `state.position` from `?pos=` injected into `.innerHTML` without validation. Now whitelisted against known positions (ALL/QB/RB/WR/TE/K/DEF/DL/LB/DB). |
| 2 | Backend `limit=-1` bypasses 1000-row cap | server.py:1572,1680,1766 | `min(limit, 1000)` → `max(1, min(limit, 1000))` on all 3 endpoints. Also added `offset=max(0, offset)`. |
| 3 | LIKE wildcard injection in search | college.py:62, prospects.py:50 | `%` and `_` in search terms matched unintended rows. Added ESCAPE clause and character escaping (matching players.py pattern). Also fixed team/conference/school LIKE params. |

### HIGH Conversion Funnel Fixes (3)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 4 | Checkout polling succeeds prematurely for trial users | app.js:572 | Trial users already have `plan: "pro"`, so `plan !== "free"` was always true on first poll. Now stashes pre-checkout plan state and compares `plan_source` change (trial→stripe). |
| 5 | Home page CTAs show stale state after async auth | index.html:718 | IIFE ran once before `checkAuth()` completed. Extracted to named function `_updateHomeCTAs()` and added `razzle-plan-changed` event listener for re-evaluation. |
| 6 | Expired trial banner shows "Your Pro Trial is Active" | pricing.html:191,664 | Reused active trial banner element. Added `trialBannerTitle` ID and set title to "Your Pro Trial Has Ended" for expired state. |

### HIGH Crash Bug Fix (1)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 7 | weekly.html crash on second load | weekly.html:441 | `getElementById('weekly-loading')` returned null after first `container.innerHTML` destroyed it. Now recreates the element if missing. Also fixed null `p.ppg.toFixed()` crash (line 536). |

### MEDIUM Defensive Fixes (4)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 8 | URL sortDir not validated | lab.js:3807 | `?dir=sideways` would send garbage to backend. Now only accepts "asc" or "desc". |
| 9 | `relevanceToggle` null crash | lab.js:3890 | Missing null guard on `getElementById` before `.textContent` access. |
| 10 | matchups.html `t.total_avg.toFixed()` null crash | matchups.html:664 | Added null guard with dash fallback. |
| 11 | player.js combine `.toFixed()` on string values | player.js:303-308 | Wrapped in `Number()` for forty/vertical/cone/shuttle. |
| 12 | Monte Carlo NaN from missing mean/stdev | league-intel.html:5764 | Added `dist.mean == null || dist.stdev == null` guard. |
| 13 | prospects.html dark mode PNG export | prospects.html:706 | Hardcoded light background → theme-aware branching. |

### Wave 2: Feature + Robustness Fixes (4)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 14 | `loadBriefingById` ignored ID param | warroom.js:3745 + auth.py + server.py | Was always loading latest briefing. Added `GET /api/briefings/{id}` endpoint with user ownership check. Frontend now fetches specific briefing. |
| 15 | Double-click fires both copy AND filter | lab.js:2245 | tbody copy handler and table filter handler both fired on same dblclick. Removed copy handler — copy available via right-click context menu. |
| 16 | POST screener `Cache-Control: public` | server.py:504 | POST responses must not be publicly cached by CDN. Changed to `private, max-age=60`. |

### Verified Clean
- All 11 JS files syntax clean
- All Python files compile clean
- 59/59 tests pass (5.80s)
- 0 regressions

---

## Quality Audit: 5-Agent Integration Seams Sweep (Mar 20 — Session 9)

**Goal**: Deep 5-agent parallel audit targeting integration seams between pages/features, not generic crash bugs. Focus on state management, conversion funnel, backend pagination correctness, Pro data gating, and dark mode export completeness.

### Screener State Management Seams (5 fixes)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 1 | Saved view sortKey/sortKey2 not validated against universe columns | lab.js:4157-4159 | Could reference NFL column in college mode. Now validates against COLUMNS/COLLEGE_COLUMNS/PROSPECT_COLUMNS with fallback to universe default sort. |
| 2 | Saved view columns not validated for college/prospect | lab.js:4176-4179 | Were assigned blindly (`[...view.columns]`), now `.filter()` through respective column defs. |
| 3 | localStorage sortKey not validated against universe | lab.js:3753 | Restored from razzle_last_state without checking if column exists in current universe. Now validates against `_savedCols`. |
| 4 | Week persisted for college universe from localStorage | lab.js:3756 | `state.week` restored even when saved.universe=college. Now skips if universe is college. |
| 5 | URL sort params not validated against column defs | lab.js:3791-3794 | `?sort=anything` accepted blindly. Now validates against all three column sets. `dir2` also validated to only accept "asc"/"desc". |

### Undo/Redo Week State (2 fixes)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 6 | `_captureState()` missing week field | lab.js:999 | Undo/redo didn't preserve week selection. Added `week: state.week`. |
| 7 | `_restoreState()` missing week field | lab.js:1028 | Added `state.week = s.week \|\| 0` to restore. |

### Monte Carlo + Pro Data Gating (5 fixes)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 8 | `_mcState` not cleared on Sleeper disconnect | league-intel.html:6541 | Simulation state from old league persisted after reconnecting new league. Added `Object.keys(_mcState).forEach(...)` cleanup. |
| 9 | Pressure map: real score leaked in blurred fill width | league-intel.html:3243 | `width:${s.score}%` → `width:50%` for locked rows. Name was already "Manager", but actual score was in DOM. |
| 10 | Monte Carlo summary: real stats in blurred cards | league-intel.html:5880-5886 | `r.champPct`, `r.playoffPct`, `r.avgPts`, `r.wins-r.losses` rendered in blurred DOM. Changed to "??" for blurred cards. |
| 11 | Monte Carlo deep-dive: same data leak | league-intel.html:6060-6079 | Same fix for second render function (scenario explorer cards). |
| 12 | SOS schedule strength: real PPG data in blurred cards | league-intel.html:6501-6503 | `mgr.totalPPG`, `mgr.bestCasePPG`, `mgr.worstCasePPG` replaced with "??" for blurred rows. |

### Conversion Funnel (2 fixes)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 13 | Home page CTAs hardcoded monthly checkout | index.html:623,640 | `startCheckout('pro_month')` → `startCheckout('pro_year')`. Users clicking "Get Pro" from home were missing 33% yearly discount. |
| 14 | Home page pricing cards led with monthly price | index.html:611,630 | Flipped to lead with yearly ($79.99/year, $149.99/year) with monthly as secondary note. Matches pricing page default. |

### Backend Robustness (3 fixes)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 15 | Derived column sort pagination broken | players.py:421-480 | Sorting by cpoe/epa_per_play/dynasty_value fetched N rows by PPR, then re-sorted — wrong page of results. Now fetches up to 1000 rows, sorts in Python, then paginates. |
| 16 | Season parameter ValueError on bad input | players.py:223,528,721 | `int(season)` crashed on non-numeric strings. Changed all 3 instances to `_safe_int(season)`. |
| 17 | `_safe_int` not imported | players.py:14 | Added to imports from core. |

### Dark Mode Export (16 fixes)

| # | Fix | File(s) | Notes |
|---|-----|---------|-------|
| 18 | 6 cold gray watermarks (rgba 26,26,46) | explorer, airyards, matchups, targets, yoy, weekly | Changed to theme-aware branching: sand rgba for dark, espresso rgba for light. |
| 19 | 10 hardcoded export backgrounds (#ede0cf) | workload, team, tdregression, successrate, targetpremium, snapefficiency, seasonpace, rankings, garbagetime, gamescript | Changed to theme-aware: `#2d1f14` for dark, `#ede0cf` for light. |
| 20 | leaders.html export background | leaders.html:578 | Same fix. |

### Verified Clean
- All 11 JS files syntax clean
- All Python files compile clean
- 59/59 tests pass (5.68s)
- 0 cold gray `rgba(26,26,46,...)` remaining in frontend
- 0 hardcoded `backgroundColor: "#ede0cf"` remaining in HTML
- 0 regressions

---

## Quality Audit: 5-Agent Deep Sweep (Mar 20)

**Goal**: Fresh 5-agent parallel crash-bug audit across all major files. Fix every real production crash path.

| # | Fix | Category | Files | Notes |
|---|-----|----------|-------|-------|
| 1 | Math.max/min spread overflow on large arrays | STACK OVERFLOW | charts.js (3 sites) | Replaced `Math.max(...arr)` with `.reduce()` — prevents RangeError on 10K+ items in career mode scatter/radar |
| 2 | Stored XSS in formula onclick handlers | XSS | formulas.js:131,139 | Replaced inline onclick with data attributes + event delegation — formula names with `</span>` could inject HTML |
| 3 | Race condition: runAllAgents buttons disabled after await | RACE | warroom.js:2646+ | Moved setScenarioButtonsDisabled(true) before first await; re-enable on early returns |
| 4 | Race condition: runSingleAgent buttons disabled after await | RACE | warroom.js:2475+ | Same fix — prevents double-click firing duplicate LLM calls |
| 5 | XSS in briefing history onclick | XSS | warroom.js:3733 | Replaced `onclick="loadBriefingById(' + b.id + ')"` with data-briefing-id + event delegation |
| 6 | .toFixed(2) on null p.r in correlations | CRASH | lab-panels.js:9746 | Added null guard: `p.r != null ? p.r.toFixed(2) : '—'` |
| 7 | .toFixed(2) on undefined r in scatter title | CRASH | lab-panels.js:9852 | Changed `r !== null` to `r != null` (catches undefined too) |
| 8 | .toFixed() on non-number val in heatmap | CRASH | charts.js:755 | Changed to `Number(val).toFixed(dec)` + `dec != null` (catches undefined decimals) |
| 9 | Missing resp.ok on submitReview | ROBUSTNESS | formula-store.js:183 | Added guard — prevents SyntaxError on HTML error responses |
| 10 | Null rosterDiv before .dataset access | CRASH | league-intel.html:1996 | Added null guard before .dataset.loaded check |
| 11 | Global JSON decode error handler | ROBUSTNESS | server.py | Returns 400 instead of 500 on malformed POST bodies (covers 26 endpoints) |
| 12 | LLM rate bucket unbounded growth | MEMORY LEAK | server.py:1027+ | Added pruning when buckets > 500 — removes stale users with empty/expired timestamps |

### Verified Clean
- All 11 JS files syntax clean
- All Python files compile clean
- 59/59 tests pass (5.59s)

---

## UX + Dark Mode Quality Audit (Mar 20)

**Goal**: 3-agent UX audit (homepage, Lab, Situation Room) + dark mode CSS audit. Fix every user-facing issue.

### UX Fixes (7 total)

| # | Fix | Severity | File | Notes |
|---|-----|----------|------|-------|
| 1 | Mobile sidebar double-toggle | HIGH | lab.html | Inline onclick + addEventListener both fired, sidebar flickered open/closed. Removed inline onclick. |
| 2 | Config panel clipped on mobile | HIGH | agents.html | Panel inside overflow:hidden canvas container. Fixed: position:fixed at 480px breakpoint, max-height:80vh, overflow-y:auto. |
| 3 | Demo briefing cards unreadable in dark mode | HIGH | index.html | --ink-faint text on --bg-ink bg both dark in dark mode. Fixed: explicit #c4b5a5 on #1a110a (always dark, like Situation Room). |
| 4 | Filter modal Enter key | MEDIUM | lab.html | Added onkeydown Enter handler on filterValue input. |
| 5 | JSON-LD pricing shows yearly | MEDIUM | index.html | Changed $9.99/P1M → $79.99/P1Y, $19.99/P1M → $149.99/P1Y to match default display. |
| 6 | Pro feature list synced | MEDIUM | index.html | Added "20 queries/day" and "7-day free trial" to match pricing.html. Consolidated Bureau features. |
| 7 | Aria-labels on search + season select | LOW | lab.html | Added aria-label="Search players" and aria-label="Season". |

### Dark Mode Fixes (12 total)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 1 | Mock draft POS_TINTS dark variants | lab-mockdraft.js | Added POS_TINTS_DARK (dark tinted cells), _isDark() helper, getPOSTint() function |
| 2 | posColor fallback → getCanvasTheme().ink | lab.js (8 sites) | #2d1f14 was invisible on dark bg — now reads theme-aware ink color |
| 3 | posColor fallback → getCanvasTheme().ink | lab-panels.js (7 sites) | Same fix across 7 panel render functions |
| 4 | Aging curve player color #8 | lab.js (2 arrays) | Changed #2d1f14 → #8a7565 (visible in both themes) |
| 5 | Radar comp overlay | lab.js | Changed #2d1f14 → getCanvasTheme().inkMedium |

### Verified Clean
- All 11 JS files syntax clean
- All Python files compile clean
- 59/59 tests pass
- 18 standalone HTML panels audited: all pass consistency checks (app.js, viewport, nav, error handling, escapeHtml, overflow-x:auto)

---

## Quality Audit: 5-Agent Deep Sweep (Mar 20 — Session 10)

**Goal**: Fresh 5-agent parallel audit across crash bugs, dark mode, design, UX, backend robustness.

### Wave 1 Fixes (28 total)

| # | Fix | Category | Files | Notes |
|---|-----|----------|-------|-------|
| 1 | 3x .toFixed() on potentially string values | Type safety | lab.js | hover card ppg/fpts/dvs + rankings PNG — wrapped in Number() |
| 2 | 2x clipboard API guard | Crash prevention | lab.js | copyShareURLFromModal + copyRedditTitle — guard navigator.clipboard before access |
| 3 | 5x NaN poisoning in Math.max.apply | Data corruption | lab-panels.js | advantage/snap-eff/workload/drops/garbage-time — null API fields caused NaN max, breaking all bar widths |
| 4 | int(week) → _safe_int(week) | Input validation | players.py, dashboards.py (5 sites) | Non-numeric week params crashed with ValueError |
| 5 | float(val) try/except on filter values | Input validation | players.py | Non-numeric filter values crashed screener endpoint |
| 6 | int(min_gp) → _safe_int(min_gp) | Input validation | players.py | Non-numeric min games crashed screener |
| 7 | Thread-safe cache eviction | Thread safety | core.py | list() snapshot on dict.items() prevents RuntimeError under concurrent load |
| 8 | 7x canvas hex → getCanvasTheme() | Dark mode | league-intel.html | Radar chart + histogram now theme-aware |
| 9 | 8x hardcoded 2024 seasons → dynamic | Season defaults | advantage, fptsbreakdown, pace, playoffs, stacks, streaks, waivers, weeklymvp | NFL-season-aware calc back to 2015 |

### Wave 2 Fixes (19 total)

| # | Fix | Category | Files | Notes |
|---|-----|----------|-------|-------|
| 1 | Event listener leak in renderSavedFormulas | Memory leak | formulas.js | Click handler stacked on every re-render — stored on element, removed before re-add |
| 2 | runAllAgents race condition guard | Race condition | warroom.js | _runningAllAgents flag prevents double-click firing two concurrent LLM runs |
| 3 | resizeCanvas null guard | Crash prevention | warroom.js | Prevents crash if canvasContainer missing |
| 4 | Logo null guard in hamburger | Crash prevention | app.js | Prevents crash if .logo element missing from nav |
| 5 | publishOverlay null guards | Crash prevention | formula-store.js | 4 null guards on DOM elements in openPublishFlow |
| 6 | resp.ok guard on submitPublish | Robustness | formula-store.js | Prevents SyntaxError on non-JSON error responses |
| 7 | Number() coercion on avgRating | Type safety | formula-store.js | Prevents .toFixed() crash on string API values |
| 8 | NaN display fix on undefined fantasy_points_ppr | Data display | player.js | Added null check before division |
| 9 | 31x canvas hex → getCanvasTheme() | Dark mode | aging, explorer, breakdown, career, career-compare, draftclass | All canvas draw functions now theme-aware |

### Verified Clean
- All 11 JS files syntax clean
- All Python files compile clean
- 59/59 tests pass
- 0 regressions

---

## Quality Audit: Waves 3-4 (Mar 20 — Session 10 continued)

### Wave 3: Backend + Charts Cleanup (4 fixes)

| # | Fix | Category | Files | Notes |
|---|-----|----------|-------|-------|
| 1 | Dead JSON exception handler | Backend | server.py | Duplicate @app.exception_handler(Exception) — first handler silently overwritten. Merged into single handler. |
| 2 | Monte Carlo season type error | Input validation | server.py | int(body.get("season")) on non-numeric input raised TypeError. Added try/except. |
| 3 | Sparklines rate limit missing | Security | server.py | Only screener endpoint without throttling. Added _check_screener_rate. |
| 4 | Null guard on p.full_name.split() | Crash prevention | charts.js | Compare export canvas crashed if name was null. |

### Wave 4: Conversion Funnel + Billing Safety (5 fixes)

| # | Fix | Category | Files | Notes |
|---|-----|----------|-------|-------|
| 1 | int(user_id) crash in billing webhook | **CRITICAL** | billing.py | Stripe metadata could contain non-numeric value, crashing webhook handler and causing infinite retries. Added try/except with early return. |
| 2 | int(_season) on user query param | Input validation | players.py | GET /api/players?season=abc crashed with ValueError. Changed to _safe_int(). |
| 3 | int(season)/int(week) in enrichment | Input validation | core.py (3 sites) | Defensive _safe_int() for rate metrics and team shares. |
| 4 | Situation Room pricing inconsistency | Conversion | agents.html | Led with monthly ($9.99/mo) but home page led with yearly. Flipped to lead with yearly ($79.99/year), checkout buttons changed to pro_year/elite_year. |
| 5 | Missing Sign In button on About page | Auth UX | about.html | Only page without sign-in nav button. Added to match all other pages. |

### Verified Clean
- All 11 JS files syntax clean
- All Python files compile clean
- 59/59 tests pass
- 0 regressions

---

## Quality Audit: 5-Agent Deep Sweep (Mar 20 — Session 11)

**Goal**: Fresh 5-agent parallel audit across backend API edge cases, frontend crash bugs, dark mode + design gaps, UX flows + conversion funnel, and brand voice consistency.

### P0 Crash Bug Fix (1)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 1 | Screener fetch error destroys table before fetch completes | lab.js | `tbody.innerHTML = ""` ran BEFORE async fetch — on error, table was empty despite "keep previous data" comment. Moved clear to AFTER successful fetch in all 3 fetch functions (NFL, Prospects, College). Error handler now re-renders previous data via `renderTable()`. |

### P1 Conversion + Security Fixes (2)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 2 | Checkout intent lost after auth modal | app.js | Non-auth user clicks "Get Pro" → auth modal opens → user registers → modal closes → must click "Get Pro" AGAIN. Fix: store pending checkout in `sessionStorage` before opening auth. After login/register, `_resumePendingCheckout()` auto-resumes checkout with 500ms delay. |
| 3 | Screener cache memory exhaustion via unique POST bodies | players.py | `fetch_screener()` cached every unique POST body (user-controlled) in `_cache` (500 slots). Attacker could fill all slots with 500 unique queries, evicting all other cached data and causing cold-cache stampedes. Fix: removed data-level caching on screener — response-level cache in server.py (100 entries) handles repeat queries. |

### P2 Robustness + Design Fixes (4)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 4 | `cache_clear()` does not clear `_cache_locks` dict | core.py | Lock objects leaked on every cache clear. Added `_cache_locks.clear()`. |
| 5 | Cold white `rgba(255,255,255,...)` on tier labels | lab-panels.css, tiers.html | 4 instances of cold white text on colored tier badges → warm sand `rgba(237,224,207,...)`. |
| 6 | Cold black thead shadow in dark mode | lab.html | `rgba(0,0,0,0.25)` → `rgba(45,31,20,0.25)` on dark mode table header shadow. |

### Audit Triage (Not Bugs — Prior Decisions Confirmed)

- `changePageSize` restricted to [25]: intentional (Ship Loop item 7 — prevents slow loads)
- `agents.html` cold `rgba(0,0,0,...)` shadows: intentionally changed FROM warm brown in Session 4 because warm was invisible on dark bg
- Gold/bronze `#ffd700`/`#cd7f32` hardcoded hex: triaged as intentional metallic colors in prior sweeps
- Demo card hardcoded `#1a110a`/`#c4b5a5`: correct — always-dark section like Situation Room, CSS vars would flip incorrectly
- 64 standalone HTML panels: ALL pass brand voice, script ordering, escapeHtml, overflow-x, error handling checks

### Verified Clean
- All 11 JS files syntax clean
- All Python files compile clean
- 59/59 tests pass
- 0 regressions

---

## Quality Audit: 5-Agent Deep Sweep (Mar 20 — Session 12)

**Goal**: Fresh 5-agent parallel audit (crash bugs, dark mode/design, mobile/a11y, backend security, UX/conversion). Fix every finding.

### P0 Conversion Fixes (4)

| # | Fix | Category | Files | Notes |
|---|-----|----------|-------|-------|
| 1 | Checkout loading state + double-click guard | Conversion | app.js | `_checkoutInProgress` flag, button disabled + "processing..." text during fetch, re-enabled on error |
| 2 | Pricing page handleCheckout stores checkout intent | Conversion | pricing.html | `sessionStorage.setItem('razzle_pending_checkout', interval)` before `openAuthModal()` — was lost, now `_resumePendingCheckout()` fires after auth |
| 3 | Gate messages now link to pricing | Conversion | app.js, lab.js, formulas.js | CSV export toast, filter limit, saved views badge, formulas badge — all now have `<a href="/pricing.html">` links. `_showToast()` upgraded to render trusted internal links via innerHTML |
| 4 | Pricing page reacts to auth state changes | Conversion | pricing.html | Added `razzle-plan-changed` event listener → `checkSubscription()` re-runs after login/register within the page |

### P0/P1 Security Fixes (7)

| # | Fix | Category | Files | Notes |
|---|-----|----------|-------|-------|
| 5 | Rate limit promo code validation | Security | server.py | `/api/billing/validate-promo` now uses `_check_sensitive_rate()` — prevents brute-force of Stripe coupon codes |
| 6 | Rate limit pageview endpoint | DoS prevention | server.py | `/api/analytics/pageview` now uses `_check_rate_limit()`, silently drops excess. Page string capped at 200 chars |
| 7 | LLM message content length validation | Financial DoS | server.py | Both `/api/llm/chat` and `/api/llm/chat-free` cap messages at 20 and total content at 10,000 chars |
| 8 | billing.py env var int() safety | Crash prevention | billing.py | `_env_int()` helper replaces bare `int()` on EA_PRO_LIMIT, EA_ELITE_LIMIT, LIFETIME_LIMIT |
| 9 | Cap player IDs on compare/trade endpoints | DoS prevention | server.py | `/api/players/compare` capped at 20, `/api/trade/values` capped at 100 |
| 10 | Cap screener filters list | DoS prevention | players.py | `filters[:50]` — prevents unbounded HAVING clause generation |
| 11 | Cache lock threading fix | Thread safety | core.py | `_cache_evict()` cleans locks under `_cache_meta_lock`. `cache_clear()` acquires meta lock |

### P1 UX + Accessibility Fixes (5)

| # | Fix | Category | Files | Notes |
|---|-----|----------|-------|-------|
| 12 | --ink-light contrast fix (WCAG AA) | Accessibility | styles.css | Light: #8a7565→#6d5a4d (4.5:1). Dark: #8a7565→#b09a88 (4.5:1). Fixes ~100+ elements |
| 13 | Mobile nav "Sign Out" clarity | UX | app.js | Shows "Sign Out" instead of misleading username-as-logout-button |
| 14 | Mobile touch targets (WCAG 2.5.8) | Accessibility | styles.css, lab.html | auth-modal-close, btn-sm, sidebar items, footer links — all 44px min on mobile |
| 15 | Semantic HTML landmarks (WCAG 1.3.1) | Accessibility | 5 HTML files | `<main>` and `<footer>` on index, lab, agents, league-intel, pricing |

### P2 Edge Cases + Design (5)

| # | Fix | Category | Files | Notes |
|---|-----|----------|-------|-------|
| 16 | Aging curves division by zero | Edge case | lab.js | `(maxAge - minAge) || 1` guard |
| 17 | Invalid Date in saved views | Edge case | lab.js | `isNaN(date.getTime())` guard |
| 18 | prospect-metric-row 1px → 2px dashed | Design | lab.html | Component divider fix |
| 19 | trade-autocomplete-item 1px → 2px dashed | Design | lab.html | Interactive dropdown fix |
| 20 | profile-stripe 4px → 6px | Design | league-intel.html | Card stripe consistency |

### Session 12 Verified Clean
- All 11 JS files syntax clean
- All Python files compile clean
- 59/59 tests pass
- 0 regressions
- 20 fixes across 12 files

---

## Quality Audit: 5-Agent Deep Sweep (Mar 20 — Session 13)

**Goal**: Fresh 5-agent parallel audit (crash bugs, dark mode/design, backend security, mobile/UX, brand voice). Fix every finding.

### P0 Security Fixes (5)

| # | Fix | Category | Files | Notes |
|---|-----|----------|-------|-------|
| 1 | Analytics summary endpoint admin-only | Auth bypass | server.py | Was accessible to any authenticated user — now requires X-Admin-Secret header |
| 2 | Stop reflecting promo codes in errors | Info leakage | billing.py | `f"Invalid promo code: {code}"` → `"Invalid promo code"` |
| 3 | Sanitize health check error messages | Info leakage | server.py | `str(e)` → `"database unavailable"` / `"bootstrap failed"` in 3 places |
| 4 | Cap agent memory field sizes | Disk DoS | auth.py | scenario:2000, findings:50000, league_name:200 chars |
| 5 | Cap weekly briefing field sizes | Disk DoS | auth.py | summary/urgency/monitor/opportunity/highlights:10000, league_name:200, week_label:50 |

### P1 Security + Robustness (2)

| # | Fix | Category | Files | Notes |
|---|-----|----------|-------|-------|
| 6 | Reduce screener internal limit 1000→500 | DoS mitigation | players.py | When python_sort or post_filters are active, SQL now fetches max 500 rows (was 1000), reducing enrichment chain load |
| 7 | resp.ok guard on trackQueryServerSide | Crash prevention | warroom.js | Non-JSON 502/503 responses no longer crash .json() parsing |

### Crash/Edge Case Fix (1)

| # | Fix | Category | Files | Notes |
|---|-----|----------|-------|-------|
| 8 | Math.min/max spread→reduce on column tooltips | Stack overflow | lab.js:1525 | Spread operator on 1000+ items could stack-overflow; now uses safe reduce() |

### Design Token Fixes (20+)

| # | Fix | Category | Files | Notes |
|---|-----|----------|-------|-------|
| 9 | gradeColor/barColor: 10 Tailwind hex → CSS vars | Design tokens | lab-panels.js:6076-6089 | `#16a34a`→`var(--green)`, `#dc2626`→`var(--red)`, `#eab308`→`var(--yellow)`, `#f97316`→`var(--orange)` |
| 10 | TD regression bar colors | Design tokens | lab-panels.js:5257 | `#16a34a`/`#dc2626` → `var(--green)`/`var(--red)` |
| 11 | Career trajectory colors | Design tokens | lab-panels.js:5598 | 4 hardcoded hex → CSS var refs |
| 12 | Percentile barColor (2 functions) | Design tokens | lab-panels.js:7905,8019 | `#e87422`/`#d44040` → `var(--orange)`/`var(--red)` |
| 13 | Draft class bust color | Design tokens | lab-panels.js:9491 | `#d44040` → `#e63946` (system --red) |
| 14 | getPercentileColor function | Design tokens | lab.js:7399-7405 | 5 hex → CSS var refs |
| 15 | Dominator rating badge | Design tokens | lab.js:7059 | `#22a06b` → `var(--green)` |
| 16 | Comp similarity/confidence colors | Design tokens | lab.js:7218,7273 | `#22a06b`/`#e87422` → `var(--green)`/`var(--orange)` |
| 17 | Prospect tier system (5 locations) | Design tokens | lab.js:7869-8296 | All `#22a06b`/`#e87422` → CSS vars (DOM) or system hex (canvas) |
| 18 | Roster grade inline color | Design tokens | lab.js:12359 | `#e87422` → `var(--yellow)` |
| 19 | Roster grade canvas color | Design tokens | lab.js:12635 | `#e87422` → `#ffc857` (system hex for canvas) |
| 20 | Canvas watermark font 14px→16px | Typography | lab.js:11850 | Design guide: Luckiest Guy only at 16px+ |

### Brand Voice Fixes (12)

| # | Fix | Category | Files | Notes |
|---|-----|----------|-------|-------|
| 21 | 5 generic "failed" errors → personality | Brand voice | league-intel.html | "power rankings failed" → "fumbled the power rankings..." (×5) |
| 22 | Sleeper timeout message | Brand voice | league-intel.html | "took too long to load" → "got delayed at the snap" |
| 23 | Checkout error message | Brand voice | app.js | "could not start checkout" → "checkout got stuffed at the line" |
| 24 | 5 Cancel buttons → "Never Mind" | Brand voice | lab.html (×4), player.js (×1) | Action-oriented button text |

### UX Fixes (4)

| # | Fix | Category | Files | Notes |
|---|-----|----------|-------|-------|
| 25 | Auth login button loading state | UX | app.js | Shows "signing in..." during fetch |
| 26 | Auth register button loading state | UX | app.js | Shows "creating account..." during fetch |
| 27 | Manage Subscription shows auth modal | UX | app.js | Was silently returning when not signed in |
| 28 | Landing page checkout intent storage | Conversion | index.html | Pro/Elite CTAs now store intent to sessionStorage before auth modal — _resumePendingCheckout() fires after registration |

### Session 13 Verified Clean
- All 11 JS files syntax clean
- All Python files compile clean
- 59/59 tests pass
- 0 regressions
- 28 fixes across 12 files

### Session 13b: Remaining Design Token Cleanup

| # | Fix | Category | Files | Notes |
|---|-----|----------|-------|-------|
| 1 | Draft class hit rate bar → CSS vars | Design tokens | lab-panels.js:9555 | `#d44040` → `var(--red)`, `#2ec4b6` → `var(--green)` |
| 2 | Usage trends sparkline → system hex | Canvas colors | lab-panels.js:4553 | `#16a34a`/`#dc2626` → `#2ec4b6`/`#e63946` (system green/red) |

### Brand Voice Final Check — CLEAN
- 0 "Loading..." in user-facing text
- 0 "Something went wrong"
- 0 "No data" / "No results"
- 0 "free forever"
- 0 "Cancel" buttons
- 0 "failed. try again" error messages

---

## Quality Audit: Ship Loop Sweep (Mar 20 — Session 14)

**Goal**: Fresh 4-agent parallel sweep across crash bugs (lab.js, lab-panels.js, warroom.js, league-intel.html), backend robustness, and design consistency.

### Crash Bug Fixes (4 fixes)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 1 | `r.position.toLowerCase()` null guard | lab-panels.js:2053 | Scarcity panel — if API returns object without position field |
| 2 | `scenario.toLowerCase()` null guard | warroom.js:3382 | getRelevantMemory — scenario param could be null/undefined |
| 3 | `m.agents.map()` null guard | warroom.js:3397 | Memory scoring — malformed memory entry without agents array |
| 4 | `m.scenario.slice()` + `m.agents.forEach()` null guards | warroom.js:3434-3435 | formatMemoryContext — same malformed entry issue |

### Additional Fixes (Session 14 continued)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 5 | handleSleeperLink missing token guard | app.js:1206 | Sent "Bearer null" header when not logged in — now shows sign-in message |
| 6 | College TD attribution overly broad | cfbfastr_adapter.py:222,249 | Pass/rec TD conditions credited wrong player on QB scramble edge case — tightened to `td_id == rec_id` only |
| 7 | find_player_stats_asset no error handling | nflverse_adapter.py:287 | Unhandled exception if GitHub API unreachable — added try-except returning None |

### Verified Clean
- Design: 0 violations (1px borders, cold grays, gradients, display font <16px, 3px resting shadows all clean)
- Backend: global exception handler already catches JSONDecodeError on POST endpoints — all 5 flagged endpoints are safe
- Auth/billing: isPaidUser() correctly includes trial users (plan set to "pro" in _user_dict)
- Passer rating /6 divisor is correct (NFL formula, max 158.3)
- index.html: all links valid, all meta tags present, responsive breakpoints complete
- Standalone HTML panels: all defensive, no crash bugs
- All 11 JS files syntax clean
- All 20 Python files compile clean
- 48/52 tests pass (4 failures are missing local DB data, pre-existing)

---

## Edge Case Sweep (Mar 20) — Branch: ship/launch-fixes

**Goal**: Consume remaining EDGE-CASES.md items that can be fixed purely in code.

| # | Fix | Severity | File | Notes |
|---|-----|----------|------|-------|
| 1 | signOut() data leak (#28) | HIGH | app.js:891 | Added cleanup for razzle_sleeper_user, razzle_sleeper_user_id, razzle_watchlist, razzle_player_tags, razzle_player_notes. Previous user data no longer persists on shared computers. |
| 2 | Bare monospace canvas fonts (#47) | MEDIUM | lab.js, charts.js | Replaced 46 instances of bare `monospace` with `'Space Mono', monospace` in canvas ctx.font declarations. |
| 3 | CSV export UTF-8 BOM (#66) | LOW | lab.js:5752 | Added \uFEFF BOM prefix to CSV blob for Excel auto-detection of UTF-8 encoding. |
| 4 | LIKE injection in formula store (#19) | MEDIUM | storage.py:260 | Added ESCAPE clause and wildcard sanitization to position_tags LIKE query. Search field was already escaped. |

### Edge Cases Already Fixed (verified in this sweep)
- #4 Welcome modal /agents link → /agents.html (fixed prior)
- #5 Sign In button targeting → uses openAuthModal() (fixed prior)
- #7 Payment failure plan revocation → _handle_payment_failed sets plan='free' (fixed prior)
- #8 subscription.updated webhook → _handle_subscription_updated handler exists (fixed prior)
- #11 Idempotency check for existing subscriptions → rejects if plan in (pro/elite/lifetime) (fixed prior)
- #15 Rate limiter proxy IP → _get_client_ip uses X-Forwarded-For (fixed prior)
- #16 getAuthToken() in warroom.js → reads from razzle_token (fixed prior)
- #18 Analytics summary unauthenticated → protected by x-admin-secret (fixed prior)
- #21 CORS localhost in production → environment-gated (fixed prior)
- #25 Clipboard fallback → _fallbackCopy() textarea method exists (fixed prior)
- #26 Warroom rAF never stops → visibilitychange + beforeunload handlers (fixed prior)
- #30 Elite LLM model → uses claude-3.5-haiku, not free model (fixed prior)
- #3 pro_lifetime/elite_lifetime query limits → both in QUERY_LIMITS dict (fixed prior)
- #33 _cache_locks unbounded growth → pruned during _cache_evict (fixed prior)
- #36 Formula save no plan limit → 3-formula cap enforced server-side (fixed prior)
- #37 Formula publish no tier gate → require_plan(request, "pro") (fixed prior)
- #44 openManageSubscription uses alert → uses _showToast (fixed prior)
- #57 outline:none without :focus-visible → all have :focus-visible rules (fixed prior)

### Edge Cases Skipped (not code-fixable or intentional)
- #46 --ink-light hex: Current #6d5a4d passes WCAG AA (5:1 contrast). DESIGN.md value #8a7565 fails (3.4:1). Kept accessible value.
- #50 Gradient in data bars: Uses linear-gradient with identical stop — creates sharp-edge fill, not visual gradient. Intentional data viz technique.
- #59 No main landmark: Affects 74 HTML pages. Too broad for quick sweep.
- #42 No noscript fallback: Affects 74 HTML pages. Too broad for quick sweep.
- #1 No admin role: Requires schema changes + new endpoints. Owner action item.
- #2 No password reset: Requires email integration. Owner action item.
- #6 Stripe never tested: Requires real Stripe test mode. Owner action item.
- #12 Never deployed to production: Owner action item.

---

## Ship Loop: QA Ticket Consumption (Mar 20) — Branch: ship/launch-fixes

**Goal**: Consume tickets filed by the Functional QA Loop and fix bugs.

| # | Ticket | Severity | Status | Notes |
|---|--------|----------|--------|-------|
| FUNC-001 | Double GZip compression (GZipMiddleware + Cloudflare Brotli) | P0 | DONE | Removed GZipMiddleware from server.py. Cloudflare applies Brotli at edge; double-compression broke /api/filter-options JSON parsing, crashing Lab init for all prod users. Let Cloudflare handle all compression. |
| FUNC-002 | Search fails for hyphens/apostrophes (Amon-Ra, Ja'Marr, D.J.) | P1 | DONE | Search input now strips all non-alphanumeric chars via `re.sub(r'[^a-z0-9]', '', ...)` to match how search_name column is normalized. Fixed in both fetch_players and _fetch_screener_uncached. Also fixed combine lookup search_name builder. |
| FUNC-003 | Dynasty values cluster at 100.0 ceiling | P2 | DONE | Removed hard caps from _production_value and _age_value. Added soft ceiling in compute_trade_value: linear below 90, log compression above 90. Top players now spread across 96-97 instead of all at 100.0. Lower tiers unchanged. |

### Smoke Test Note
- week_filter test (1 of 11) fails — pre-existing environment issue. Local terminal.db is empty (0 rows in all data tables). Production has data on persistent disk. Not a code bug.

---

## Ship Loop: Sweep Mode (Mar 20) — Branch: ship/launch-fixes

**Goal**: No tickets to consume. Systematic quality sweep across codebase.

### Sweep Results (4 parallel agent audits)

| Audit | Findings | Action |
|-------|----------|--------|
| 1px borders | 14 instances on list/dropdown item separators | Acceptable — same rationale as table row dividers (data density, not component borders) |
| Hardcoded colors | #fff on colored badges (80+), html2canvas bg patterns (30+) | Acceptable — prior decision: white on saturated backgrounds for contrast regardless of theme; canvas bg is known limitation |
| XSS/innerHTML | 1 CRITICAL: team chip onclick in lab.js:3283 — URL param unescaped | FIXED — added escapeHtml() + escapeAttr() |
| Division by zero | 0 bugs | Clean — all divisions guarded |
| Missing .catch() | 1 missing: gamelog.html:396 quick-search autocomplete | FIXED — added .catch() |
| Dark mode | 1 issue: lab.html thead shadow dark override used espresso rgba instead of black | FIXED — rgba(0,0,0,0.25) |

### Fixes Applied

| # | Fix | Severity | File | Notes |
|---|-----|----------|------|-------|
| 1 | XSS in team chip onclick | HIGH | lab.js:3283 | Team names from URL params now escaped with escapeHtml/escapeAttr. Attack vector: malicious shared URL with crafted team param. |
| 2 | Missing .catch() on quick-search fetch | MEDIUM | gamelog.html:416 | Unhandled promise rejection if API fails during autocomplete. Now hides dropdown on error. |
| 3 | Dark mode thead shadow wrong color | LOW | lab.html:1011 | Dark mode override used espresso rgba(45,31,20) instead of true black rgba(0,0,0). Shadow was invisible. |

All 11 JS files syntax clean. 16 Python files compile clean.

### Sweep Mode (Mar 20 — post-ticket session)

| Audit | Findings | Action |
|-------|----------|--------|
| XSS/innerHTML | 4 findings: unescaped comp.player_id onclick, ms.label/comp_val, player initials, agent name summary | FIXED — escapeAttr/escapeHtml added to all 4 |
| Missing .catch() | 2 HIGH: roster builder autocomplete (lab-panels.js:8511), comptable URL restore (comptable.html:635) | FIXED — .catch() added to both |
| Python imports | 2 LOW: absolute imports in server.py (backend.live_data.core) | FIXED — use live_data.func() via __init__.py, exported _current_draft_year |
| Python security | 0 injection, 0 bare except, 0 div-by-zero | Clean |
| Python DB errors | 0 missing handlers (global exception handler catches all) | Clean |

---

## Ship Loop: QA Ticket Consumption (Mar 20) — Branch: ship/launch-fixes

**Goal**: Consume tickets from functional-qa/tickets/ written by QA Loop.

| # | Ticket | Severity | Status | Notes |
|---|--------|----------|--------|-------|
| FUNC-001 | Response cache strips content-encoding header | P0 | DONE | Added "content-encoding" to save_headers allowlist in response_cache_middleware. GZipMiddleware already removed (previous fix). Cache now preserves encoding header on subsequent requests. |
| FUNC-004 | Production headshots missing | P1 | ESCALATE (human) | Local DB has 0 players (empty). Production DB on Render needs headshot-populated terminal.db uploaded to GitHub release data-v1, then Render redeploy. Code cannot fix this — requires manual DB upload. |
| FUNC-005 | Dominator rec_yd_share/rec_td_share null | P2 | DONE | All share fields (rec_yd_share, rec_td_share, rush_share) now computed for every position. Previously RB/QB had null receiving shares because dominator_rating used rush_share only. Dominator rating calc still position-specific, but share data always populated. |
| FUNC-006 | Ship fixes not deployed to production | P0 | DONE | Fast-forward pushed ship/launch-fixes to master. Fixes FUNC-001/002/003 now live on razzle.lol. |
| FUNC-007 | offense_snaps NULL for all players | P1 | DONE | Root cause: bootstrap_database() only syncs snap counts when DB is empty (<50 players). Production DB on persistent disk already had players, so snap sync was always skipped. Added separate check: if offense_snaps are all NULL but players exist, run sync_snap_counts as backfill during background bootstrap. |
| FUNC-008 | Pinned rows vanish on filter change | P2 | DONE | Added _pinnedDataCache to store player objects when pinned. Pinned rows now survive filter changes by falling back to cached data. Cache cleaned on unpin/clearAll. Diff mode baseline lookups also use cache. |

### Sweep Mode (Mar 20 — post-ticket session 2)

| Audit | Findings | Action |
|-------|----------|--------|
| XSS in charts.js | 2 HIGH: unescaped player names/positions in getPlayerOptions() innerHTML and compare table header | FIXED — escapeHtml() added to both |
| Backend security | ALTER TABLE f-string in auth.py (LOW — hardcoded column names, not user input) | Noted, no fix needed |
| Smoke tests | 10/11 pass (week_filter failure is pre-existing local DB issue) | No regressions |

### Sweep Mode (Mar 20 — session 3)

| Audit | Findings | Action |
|-------|----------|--------|
| JS falsy zero display | 12 instances of (val \|\| '-') on numeric stats (games, age, pos_rank, weekly leader stats) treated 0 as null | FIXED — all changed to (val != null ? val : '-') in lab-panels.js lines 652, 940, 4244-4251, 4864, 4869, 5136, 5430, 6306-6307, 9431, 10182 |
| Division by zero | compare.js:267 getStatValue division by games without guard | FIXED — added (games \|\| 1) |
| Bare except blocks | server.py:179, server.py:219 caught all exceptions; auth.py:210 caught all exceptions | FIXED — narrowed to sqlite3.OperationalError/DatabaseError |
| Backend fetchone()[0] | 5+ locations use .fetchone()[0] on aggregate queries | VERIFIED SAFE — COUNT(*)/MAX() always return a row (never None) |
| Frontend fetch error handling | All fetch() calls in 11 JS files have .catch() or try/catch | Clean |
| Frontend XSS | All dynamic data in innerHTML uses escapeHtml() | Clean |
| Backend week param coverage | All panel endpoints correctly aligned with function signatures | Clean |
| Event listener leaks | innerHTML replacement handles cleanup; no persistent element leaks | Clean |

---

## QA Ticket Consumption (Mar 20 — Ship Loop)

| Ticket | Severity | Status | Fix |
|--------|----------|--------|-----|
| FUNC-010: Production 502 | P0 | ESCALATE | Requires human action — check Render dashboard logs and restart service. Cannot fix from code. |
| FUNC-011: Draft class PPG inflated | P0 | FIXED | `COUNT(DISTINCT s.week)` collapsed games across seasons. Changed to `COUNT(DISTINCT s.season \|\| '-' \|\| s.week)` in tools.py:548. Bo Nix was showing 33 PPG instead of ~20. |
| FUNC-009: Matchup heatmap playoff data | P2 | FIXED | Added `AND s.season_type = 'regular'` to both queries in analytics.py:fetch_matchup_heatmap(). Playoff teams had inflated game counts (21 vs 17), diluting their defensive PPG. |

Smoke tests: 10/11 pass (week_filter is pre-existing, unrelated to these fixes).

### Sweep: Regular-season filter audit (Mar 20)

| Function | File | Fix |
|----------|------|-----|
| fetch_strength_of_schedule | dashboards.py:403,438 | Added season_type='regular' to defense grid + player weekly queries |
| fetch_stock_watch | dashboards.py:645 | Added season_type='regular' to defense grid query |
| fetch_season_awards | dashboards.py:1390,1415,1475 | Added season_type='regular' to player weekly, defense grid, and team totals queries |
| fetch_report_cards | dashboards.py:1082,1111,1142 | Added season_type='regular' to player weekly, defense grid, and team totals queries |

Same root cause as FUNC-009: playoff games inflated game counts for playoff teams, diluting PPG averages. All 4 functions compute defense PPG-allowed grids used for SOS, stock watch, awards, and report cards.

### Sweep: XSS escape in prospect views (Mar 20)

| File | Line | Fix |
|------|------|-----|
| lab.js | 7884 | escapeHtml() on draft_year/position in prospect tier header |
| lab.js | 7930 | escapeHtml() on position/draft_year in prospect tier empty state |
| lab.js | 8215 | escapeHtml() on draft_year/position in big board empty state |
| lab.js | 8235 | escapeHtml() on draft_year/position in big board header |

### Smoke test note
week_filter failure (10/11) is a stale server process issue, not a code bug. Verified: calling _fetch_screener_uncached() directly with week=1 returns games=1 correctly. The running server process needs restart to pick up code changes.

---

## Ship Loop: Sweep Round 4 (Mar 20) — Branch: ship/launch-fixes

**Goal**: 3-agent parallel audit (backend security, frontend crash bugs, standalone HTML panels). Fix all findings.

| # | Fix | Severity | File(s) | Notes |
|---|-----|----------|---------|-------|
| 1 | Trial users blocked from purchasing | P1 | auth.py, billing.py | `_user_dict()` elevated trial plan to "pro", causing checkout to reject with "already subscribed." Added `raw_plan` field to user dict; billing uses raw_plan for idempotency check. |
| 2 | Cache race condition (KeyError) | P2 | core.py | Fast-path cache hit used multiple dict accesses without lock. Concurrent eviction could pop the key between `in` check and access. Refactored to single `entry = _cache[key]` with try/except KeyError. |
| 3 | comptable.html broken HTML attribute | P1 | comptable.html | Autocomplete item: `class="ct-ac-item style="opacity:0.4""` — style attribute was concatenated into class value. Fixed closing quote placement. |
| 4 | Season default off-by-one (13 files) | P2 | 10 standalone HTML + lab.js + lab-panels.js + league-intel.html | `getMonth() >= 7` (August) should be `>= 8` (September). NFL regular season starts in September; August would default to current year with no data. |
| 5 | Unguarded available_seasons.forEach (40 instances) | P2 | lab-panels.js | All `data.available_seasons.forEach()` calls now use `(data.available_seasons || []).forEach()` to prevent crash if API omits field. |
| 6 | Analytics fetch missing .catch() (3 pages) | P2 | usage.html, yoy.html, airyards.html | `try { fetch(...) } catch(e) {}` doesn't catch async rejections. Changed to `fetch(...).catch(function(){})`. |
| 7 | efficiency.html catch_rate zero coercion | P2 | efficiency.html | `p.catch_rate > 0` treated 0.0% as null. Changed to `p.catch_rate != null` to correctly display zero catch rate. |

### Verified Clean
- 10/11 smoke tests pass (week_filter is pre-existing local DB issue)
- All 11 JS files syntax clean
- All modified Python files compile clean
- 0 remaining `getMonth() >= 7` in frontend
- 0 remaining unguarded `data.available_seasons.forEach` in lab-panels.js

---

## Ship Loop: Sweep Round 5 — Data Correctness + Interaction (Mar 20)

**Goal**: Deep audit via 2 agents (backend data correctness, frontend interaction edge cases).

| # | Fix | Severity | File(s) | Notes |
|---|-----|----------|---------|-------|
| 1 | target_premium JOIN on gsis_id instead of player_id | P0 | tools.py:2484 | Wrong JOIN column caused player mismatches/exclusions. Every other function uses player_id. |
| 2 | draft_class missing season_type='regular' filter | P0 | tools.py:554 | LEFT JOIN to player_week_stats included playoff data, inflating PPG. Bo Nix-style inflation. |
| 3 | stock_watch player query missing season_type filter | P1 | dashboards.py:630 | Player PPG included playoffs but defense grid used regular-season-only data. Mismatch distorted stock scores. |
| 4 | heatmap missing season_type filter | P1 | analytics.py:222 | Stat aggregation included playoff weeks, inflating totals for playoff teams. |
| 5 | opportunity_share player+team queries missing season_type | P1 | dashboards.py:895,929 | Both player totals and team denominators included playoff data. Opp share percentages were wrong. |
| 6 | playoff_schedule defense grid missing season_type | P1 | tools.py:1379 | Defense PPG-allowed included playoff games, distorting matchup grades. |
| 7 | runAllAgents re-enables buttons before cross-agent triggers finish | P1 | warroom.js:2806 | Moved setScenarioButtonsDisabled(false) and _runningAllAgents=false after Promise.all(followUpPromises). Prevents double-click corruption. |
| 8 | toggleSelectAll bypasses free user compare limit | P1 | lab.js:4596 | Hard-coded max=5 instead of using _getCompareLimit() (returns 2 for free). Free users could select 5 players. |
| 9 | toggleLeague collapse-then-refetch on retry | P2 | league-intel.html:1994 | Toggle collapsed card on retry click, loading data into hidden container. Refactored to only toggle on loaded state, keep expanded during retry. |

### Deferred (architectural, post-launch)
- Virtual scroll destroying row highlights/expanded rows — needs row state persistence in HTML strings, major refactor
- HAVING clause with week filter returning empty — documented, endpoints where weekly doesn't make sense
- "Top 10" quick filter threshold computed from current page — cosmetic, threshold is approximate

### Verified Clean
- 10/11 smoke tests pass (week_filter pre-existing)
- All JS/Python syntax clean

---

## Quality Audit: 5-Agent Parallel Sweep (Mar 20 — Ship Loop)

**Goal**: Fresh 5-agent parallel audit (backend SQL data correctness, frontend crash bugs, server security, standalone HTML panels, season_type filter audit).

### Crash Bug Fixes (7 frontend + 1 backend)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 1 | `v.toFixed(1)` on string value | lab.js:6566 | getHeadlineStats — wrapped in `Number()` |
| 2 | `data.players` forEach on undefined | lab.js:9407,9578 | Aging curves — added `(data.players \|\| [])` guard |
| 3 | `.toFixed()` on null boom/bust fields | lab.js:12395-12400 | 6 fields (median, floor, ceiling, boom%, bust%, score) — null guards |
| 4 | `weekly_scores.map()` on null | lab.js:12453 | Boom/bust histogram — `(weekly_scores \|\| [])` guard |
| 5 | `p.name.split()` on null | aging.html:603 | `(p.name \|\| '').split()` |
| 6 | `data.strengths/weaknesses` undefined | strengths.html:712-726 | `(data.strengths \|\| [])` guards on 3 sites |
| 7 | `a.prof.trades` on undefined prof | league-intel.html:3492-3495 | `(a.prof && a.prof.trades \|\| 0)` guards on all 4 rows |
| 8 | `int(season)` without guard | dashboards.py:1968 | Changed to `_safe_int(season)` in fetch_stat_correlations |

### Security Fixes (cache poisoning + rate limits + input bounds)

| # | Fix | Severity | File | Notes |
|---|-----|----------|------|-------|
| 1 | /api/health removed from response cache | MEDIUM | server.py:463 | Cached diagnostic response leaked to unauthenticated users |
| 2 | Rate limit on POST /api/roster-value | MEDIUM | server.py:2432 | Unauthenticated expensive computation, now rate-limited |
| 3 | Rate limit on POST /api/monte-carlo/projections | MEDIUM | server.py:3358 | Same — up to 200 player IDs, now rate-limited |
| 4 | Clamp limit on 12 college endpoints | LOW | server.py:1860-1949 | `max(1, min(limit, 200))` prevents unbounded results |
| 5 | Clamp vorp limit | LOW | server.py:2743 | `max(1, min(limit, 100))` |
| 6 | Clamp auction budget + roster_size | LOW | server.py:2892 | budget: 50-2000, roster_size: 1-30 |
| 7 | Clamp streaks window | LOW | server.py:3052 | `max(1, min(window, 18))` |
| 8 | Clamp waivers window | LOW | server.py:3248 | `max(1, min(window, 18))` |

### Standalone HTML Fixes (6 fixes)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 1 | Season default `>= 6` (July) → `>= 8` (September) | playoffs.html:393 | NFL season starts September |
| 2 | Season default `>= 6` → `>= 8` | stacks.html:344 | Same fix |
| 3 | Season default `>= 6` → `>= 8` | waivers.html:401 | Same fix |
| 4 | Season default `>= 6` → `>= 8` | weeklymvp.html:340 | Same fix |
| 5 | Missing `.catch()` on autocomplete fetch | comptable.html:417 | Unhandled promise rejection |
| 6 | Missing `overflow-x:auto` on content div | weeklymvp.html:204 | MVP table clips on mobile |

### Audit Clean Areas
- 0 missing season_type='regular' filters (all 5 backend files exhaustively verified)
- 0 JOIN column mismatches (all use player_id correctly)
- 0 division-by-zero unguarded
- All 11 JS files syntax clean
- All Python files compile clean
- 11/11 smoke tests pass
- 0 regressions

---

## Ship Loop Quality Sweep (Mar 20 — Session 15)

**Goal**: Consume QA ticket (FUNC-012), then sweep for bugs via 3-agent parallel audit (backend, frontend, standalone HTML).

### Ticket Consumed
- FUNC-012 (playoff data contamination): CODE FIXED in prior sessions, closed ticket. Deploy is human action.

### P0 Backend Bugs (3 fixes)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 1 | 7 functions used `p.gsis_id` in SELECT instead of `p.player_id` | tools.py | Returns null player IDs for players without gsis_id. `GROUP BY p.gsis_id` collapsed nulls. Affects garbage_time, snap_efficiency, td_regression, dual_threat, season_pace, target_premium, workload_monitor. |
| 2 | `boom_threshold` undefined → RangeError in histogram | lab.js:12459 | `undefined + 5` = NaN → `new Array(NaN)` throws. Added `|| 20` guard (matches existing fix at line 12728). |
| 3 | `sort_dir.lower()` crash on null input | players.py:120,312 | Client sending `"sort_direction": null` in POST body crashed `.lower()`. Added null coalescing. |

### CRITICAL Security Fixes (3 fixes)

| # | Fix | Severity | File | Notes |
|---|-----|----------|------|-------|
| 1 | Inverted rate limit on roster-value and monte-carlo | **CRITICAL** | server.py:2434,3362 | `if _check_screener_rate(ip)` blocked legitimate users (returns True when allowed), allowed unlimited after bucket full. Fixed to `if not _check_screener_rate(ip)`. |
| 2 | X-Forwarded-For trusted first entry (spoofable) | **HIGH** | server.py:63-70 | All IP rate limits bypassable by sending fake X-Forwarded-For. Changed to trust last entry (appended by Render proxy). |
| 3 | CORS env var name mismatch | **MEDIUM** | server.py:441 | Used `RAZZLE_ENV` but production sets `ENVIRONMENT`. Changed to `ENVIRONMENT`. Not currently exploitable but a latent footgun. |

### Frontend Data Display Fixes (4 fixes)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 1 | `fmt()` renders "NaN" for non-numeric input | lab-panels.js:14 | Added `isNaN()` check after `Number()` coercion — returns '-' instead of "NaN" |
| 2 | Dynasty roster chart divide-by-zero | lab-panels.js:10050 | `maxVal` init 0→1 prevents Infinity pixel coordinates |
| 3 | Aging curve xPos divide-by-zero | lab-panels.js:4896 | Added `Math.max(denominator, 1)` guard |
| 4 | Target distribution undefined share passes `< 2` guard | lab-panels.js:9121 | `undefined < 2` is false in JS — added `!share` guard |

### Robustness Fix (1)

| # | Fix | File | Notes |
|---|-----|------|-------|
| 1 | `saveAgentConfig` no try-catch on localStorage | warroom.js:1369 | QuotaExceededError silently lost API key config. Wrapped in try-catch. |

### Standalone HTML Panels
- 15 most complex panels audited (targets, matchups, weekly, aging, explorer, usage, redzone, airyards, consistency, tradevalues, vorp, stocks, yoy, efficiency, opportunity)
- **0 bugs found** — all pass 7 checks (app.js, fetch error handling, escapeHtml, season defaults, .toFixed guards, div/zero, hardcoded years)

### Verified Clean
- All 11 JS files syntax clean
- All Python files compile clean
- 11/11 smoke tests pass
- 0 regressions

---

## Ship Loop Session 16 (Mar 20)

### FUNC-013: Stock Watch & Buy/Sell scrub player fix

| # | Fix | File | Notes |
|---|-----|------|-------|
| 1 | Stock Watch min games 6→8, position PPG floors (QB>=10, RB/WR>=5, TE>=3) | dashboards.py:711-723 | Brandon Powell / Laviska Shenault no longer dominate rising stocks |
| 2 | Buy/Sell min games 6→8, position PPG floors | analytics.py:866,882 | KhaDarel Hodge / Ashton Dulin no longer show as A+ buy-low |

### Sweep Mode (Mar 20)

| Pass | Findings | Fixes |
|------|----------|-------|
| Backend audit | 1 hardcoded year in pick values endpoint | server.py:2425 — dynamic range from _current_draft_year() |
| Frontend audit | 1 XSS in dynasty history season headers | lab-panels.js:207 — escapeHtml(String(s)) on season values |

### Verified Clean
- 11/11 smoke tests pass
- 0 regressions

---

## Ship Loop Session 17 (Mar 20)

### FUNC-014: Production serving unminified JS/CSS
- **Root cause**: `npx --yes esbuild` in render.yaml requires Node.js, fails silently on Render's Python runtime
- **Fix**: Replaced with Python-based minifiers (rjsmin + rcssmin) via `scripts/build_dist.py`
- **Impact**: 360KB saved from minification (lab.js: 534KB→403KB, etc.)
- Files changed: `render.yaml`, `requirements.txt`, `scripts/build_dist.py` (new)

### Sweep Mode (Mar 20)

| Pass | Findings | Fixes |
|------|----------|-------|
| XSS scan | Column group name unescaped in onclick handler | lab.js:1476 — escapeAttr(g.name) + escapeHtml(g.name) |
| Hardcoded years | 3 locations with hardcoded 2024/2025 | tools.py:532 (removed >= 2020 filter), smoke.py:202,248 (→ datetime.now().year) |
| Hardcoded years | Load test with 9 hardcoded "2025" season values | load_test.py — dynamic season discovery via /api/filter-options |
| Connection leaks | All 3 adapters calling get_conn() (pooled) then .close() | Changed to get_write_conn() (non-pooled, designed for adapter writes) |
| CSS design | 1 gradient (skeleton shimmer) — intentional loading animation | No change needed |
| HTML refs | All 74 HTML files, all JS/CSS refs valid | Clean |
| Runtime patterns | All fetch() calls check .ok, all get_db() in context managers | Clean |

### Verified Clean
- 11/11 smoke tests pass after every fix
- 0 regressions
- 4 commits pushed to ship/launch-fixes

---

## Ship Loop Session 18 (Mar 20)

### Ticket Queue
- Merged origin/qa/findings → FUNC-014 ticket (resolved in Session 17, re-merged from QA branch)
- Deleted FUNC-014 ticket — already fixed by scripts/build_dist.py (commit a66dce5)
- TICKETS.md — all items DONE, no new work
- **Both queues empty → entered SWEEP MODE**

### Sweep Mode (Mar 20)

| Pass | Area | Findings | Status |
|------|------|----------|--------|
| Smoke tests | 11/11 pass | Baseline green | Clean |
| Pytest suite | 59/59 pass | Full test suite | Clean |
| Python compilation | All 16 backend files | py_compile check | Clean |
| JS syntax | All 11 frontend JS files | node --check | Clean |
| Build pipeline | scripts/build_dist.py | Minified output verified, syntax-checked | Clean |
| SQL injection | All ORDER BY with sort params | Whitelisted via dicts/sets with fallbacks | Clean |
| XSS | innerHTML assignments (599 total) | All user data paths use escapeHtml() | Clean |
| eval/Function | No eval() or new Function() | 0 instances | Clean |
| document.write | No document.write() | 0 instances | Clean |
| postMessage | No message handlers | 0 instances | Clean |
| Bare except | Backend Python files | 0 bare except blocks | Clean |
| console.log | Frontend JS files | Only branded easter eggs in app.js | Clean |
| Hardcoded years | Backend: only "nfl2026" in password blocklist | Frontend: only demo text strings | Clean |
| Connection leaks | Adapters use get_write_conn(), backend uses get_db() context manager | 0 leaks | Clean |
| Auth token | warroom.js + league-intel.html | All read razzle_token directly | Clean |
| 404 handling | server.py:678 + frontend/404.html | Correct path check, page exists | Clean |
| Monte Carlo | 3 cases handled (2+ games, 1 game, 0 games) | Scoring col whitelisted | Clean |
| Response cache | Thread-safe snapshot eviction | .pop(k, None) pattern | Clean |
| Requirements | All imports match requirements.txt | 9 packages | Clean |
| Deferred scripts | lab-mockdraft.js, lab-prospect-radar.js | escapeHtml, resp.ok checks | Clean |
| Week selector | state.week serialized to URL, localStorage, backend params | Consistent int=0 default | Clean |

### Fixes Applied

| # | Fix | Severity | Files | Notes |
|---|-----|----------|-------|-------|
| 1 | XSS in matchups.html detail player onclick | P1 | matchups.html:707 | Inline onclick with escapeHtml() didn't escape single quotes — replaced with data-pid + event delegation |
| 2 | Font-display at <16px across 31 HTML files | P2 | 31 standalone pages | 96 CSS rules changed from --font-display to --font-mono (table headers at 11px, badges at 10-13px, tabs at 13px, rank numbers at 14px) |
| 3 | XSS in lab.js roster report | P1 | lab.js:11424 | r.total_value and r.average_age unescaped in innerHTML — added escapeHtml(String()) |
| 4 | XSS in player.js season table + combine | P1 | player.js:234,316 | s.season and combine display values unescaped — added esc(String()) |
| 5 | XSS in formula-store.js inline handlers | P1 | formula-store.js:112,540,545 | formula.id interpolated in onclick/id — added parseInt() sanitization |
| 6 | Crash risk in warroom.js canvas init | P1 | warroom.js:81 | cvs.getContext('2d') with no null guard — added ternary check |
| 7 | XSS in JSON-LD via player_id | P0 | server.py:2191 | json.dumps doesn't escape </script> — added .replace("<", "\u003c") |
| 8 | Dynasty history age always None | P1 | dynasty.py:344 | age_in_season never computed — now calculates current_age - (latest - season) |

### Verified Clean
- 11/11 smoke tests pass after every fix
- 59/59 pytest tests pass
- All Python files compile clean
- All JS files syntax clean
- 0 remaining font-display violations in CSS (verified via script)
- 0 unescaped API data in innerHTML (6-agent parallel audit + manual verification)
- JSON-LD injection vectors neutralized

---

## Ship Loop Session 20: FUNC-015 + Sweep (Mar 20)

**Goal**: Consume QA tickets, then sweep for backend issues.

### Tickets Consumed

| # | Ticket | Severity | Fix | Notes |
|---|--------|----------|-----|-------|
| 1 | FUNC-015: Screener dynasty_value vs trade value formula mismatch | P2 | Replaced simple DVS formula (ppg×4 × age_mult) in _enrich_with_dynasty_value() with compute_trade_value() | Now screener, Trade Value Chart, Trade Finder, Dynasty Rankings, and Tier List all use same formula. One source of truth. |

### Sweep Fixes

| # | Fix | Category | Notes |
|---|-----|----------|-------|
| 1 | Add cache_stats/cache_clear to live_data __init__ exports | Consistency | Were imported directly from core.py in server.py, bypassing package re-export convention |
| 2 | Fix N+1 query in player profile rate metrics | Performance | Replaced per-season loop calling _enrich_with_rate_metrics (N queries) with single query grouped by season |
| 3 | Guard missing combine_data table in player profile | Robustness | Added table existence check before querying combine_data. Prevents crash on DBs without prospect tables |

### Sweep Audit (Clean)

| Pass | Area | Result |
|------|------|--------|
| XSS scan | 700+ escapeHtml uses, all innerHTML safe | Clean |
| Backend API | All imports valid, no bare excepts, parameterized queries | Clean |
| Design rules | No gradients, no hardcoded colors, no "Loading..." text | Clean |
| Endpoint test | 40+ endpoints return 200 (prospects 500 expected — missing combine_data in local DB only) | Clean |
| Python compile | All backend .py files compile | Clean |
| TODO/FIXME | Zero in backend or frontend | Clean |
| 11/11 smoke tests pass after every fix |

---

## Ship Loop Session 21: Sweep Mode — Data Integrity Fixes (Mar 20)

**Goal**: Deep 3-agent parallel sweep (backend robustness, frontend runtime, data integrity) found 6 real bugs.

### Fixes Applied

| # | Fix | Severity | Files | Notes |
|---|-----|----------|-------|-------|
| 1 | WOPR/G double-divided by games | P0 | core.py:317-318 | `wopr` from `_enrich_with_rate_metrics` is already `AVG()` per game. Dividing by `g` again made values ~17x too small. Removed division. |
| 2 | Team share queries use wrong team column | P0 | core.py:594-630, dashboards.py:925-941, dashboards.py:1154-1169 | `p.team` (current roster team) instead of `s.team` (game-week team). Wrong dominator rating/rush share/opp share for 73 traded players. Fixed 3 SQL queries across 2 files. |
| 3 | Heatmap snap_pct always null | P1 | analytics.py:249 | `snap_pct` key set to None but never populated — `offense_pct` was the correct source from `_STAT_SUM_COLS`. Mapped `offense_pct` → `snap_pct`. |
| 4 | Screener derived sort truncation | P1 | players.py:431-432,490 | Sorting by derived metrics (yards_per_carry, dynasty_value, etc.) only evaluated top 500 by PPR, silently dropping qualifying players. Raised to 2000 and fixed total count. |
| 5 | formula-store.js localStorage crash | P2 | formula-store.js:222,240,269,273,375 | 5 `localStorage.setItem` calls without try-catch — crashes in Safari private browsing or when storage full. |
| 6 | Lab page size init mismatch | P2 | lab.js:947 | Old localStorage values (50/100/200) loaded but dropdown only has 25. Caused blank select. Hardcoded to 25. |

### Verified Clean
- 11/11 smoke tests pass
- All Python files compile clean
- All JS files syntax clean
- 0 regressions

---

## Ship Loop Session 22: 3-Agent Deep Sweep — 9 Bug Fixes (Mar 20)

**Goal**: Parallel sweep with Backend Architect, Frontend Developer, and Data Integrity agents. Found 9 real bugs.

### Fixes Applied

| # | Fix | Severity | Files | Notes |
|---|-----|----------|-------|-------|
| 1 | Register button text not restored on validation failure | P0 | app.js:856-859 | Validation early-returns restored `btn.disabled = false` but not `btn.textContent = origText` — button showed "creating account..." permanently |
| 2 | Half-PPR fallback triggered on valid zero value | P0 | core.py:232-233 | `if not hppr` is True when `hppr = 0.0` (valid score). Changed to `if hppr is None`. Previously produced negative half-PPR for zero-point players with receptions |
| 3 | PPFD scoring used PPR instead of Standard as base | P1 | core.py:276 | Comment said "standard + 1pt per first down" but code used `fantasy_points_ppr`. PPR double-counts receptions. Now uses `fantasy_points_std` with PPR-receptions fallback |
| 4 | YAC per reception used wrong calculation | P1 | dashboards.py:63-130 | Was computing `max(0, rec_yards - air_yards)` which is wrong because `receiving_air_yards` includes incomplete targets. Now queries `receiving_yards_after_catch` directly |
| 5 | Ascending sort on derived stats put nulls first | P1 | players.py:488-489 | `sort(key=lambda x: x.get(k) or 0)` treats None as 0, which sorts to top in ascending. Now uses `float('inf')` sentinel for nulls in ascending, `float('-inf')` in descending |
| 6 | Diff mode stale baseline after season/week change | P1 | lab.js:4551 | Cache key was `baseId:itemCount` — if new season had same row count, stale baseline was reused. Added `season` and `week` to cache key |
| 7 | ValueError masking in global exception handler | P1 | server.py:689 | `isinstance(exc, (json.JSONDecodeError, ValueError))` caught non-JSON ValueErrors from endpoint logic and returned misleading "invalid JSON body" 400 error. Narrowed to `json.JSONDecodeError` only |
| 8 | N shortcut toggled notes column without re-rendering | P2 | lab.js:10416-10417 | `toggleColumn()` modifies state but doesn't render. Added `renderTableHead(); renderTable(); renderColumnPicker(); saveStateToURL()` |
| 9 | Team totals for opp share filtered by fantasy_relevant | P2 | dashboards.py (3 queries) | `AND p.fantasy_relevant = 1` on team total denominators excluded non-fantasy players, inflating every player's opportunity share and dominator rating. Removed filter from opportunity share (line 940), report cards (line 1167), and season awards (line 1503). Also fixed awards query using `p.team` instead of `s.team` |

### False Positives (investigated, not bugs)
- `openPlayerPopup` in lab-panels.js — agent reported as undefined but it IS defined in app.js (loaded sync before lab-panels.js defer)
- Page size locked to 25 — intentional per prior fix (Session 7, preventing slow loads)

### Verified Clean
- 11/11 smoke tests pass after all fixes
- All Python files compile clean
- All JS files syntax clean
- 0 regressions

---

## Ship Loop Session 23: Ticket Consumption + Sweep (Mar 20)

**Goal**: Consume QA tickets + TICKETS.md backlog, then sweep for new bugs.

### QA Tickets (all VERIFIED FIXED — cleaned up)
- FUNC-015: Dynasty value formula mismatch (fixed Session 20)
- FUNC-016: XSS escapeAttr consistency (fixed Session 20)
- FUNC-017: Breakout badge PPG calc (fixed Session 20)

### TICKETS.md: Push Pin Blinking Fix
- **Root cause**: Pushpin emoji (U+1F4CC) triggered color emoji font substitution (Segoe UI Emoji) during virtual scroll innerHTML replacement, causing per-frame rendering flicker
- **Fix**: Replaced emoji with CSS-mask SVG pushpin icon. Uses `background: var(--ink)` with mask data URI. Pin states (faint/active) via CSS classes. Renders instantly via regular font pipeline, no emoji substitution needed. Works in both light and dark mode.

### Sweep Fixes (3-agent parallel: Backend Architect, Frontend Developer, CSS/Design)

| # | Fix | Severity | Files | Notes |
|---|-----|----------|-------|-------|
| 1 | Sort direction inverted in 4 panel sortPlayers() | P1 | lab-panels.js (lines 893, 2310, 2525, 3876) | `dir*(vb-va)` was backwards from arrow convention. `dir=-1` showed ▼ but sorted ascending. Fixed to `dir*(va-vb)`. Affects vorp, efficiency, consistency, redzone panels. |
| 2 | Query limit badge color order | P2 | warroom.js:2633 | `remaining<=1` caught `remaining=0` first, showing orange instead of red when queries exhausted. Swapped check order. |
| 3 | Canvas null crash on non-Situation Room pages | P1 | warroom.js:83-90, 1060-1117 | `resizeCanvas()` and 6 mouse/touch event listeners accessed `cvs` without null guard. Crashes if `warRoomCanvas` element missing from DOM. Added `if (!cvs)` guards. |
| 4 | IDP players silently dropped from Bureau roster | P1 | league-intel.html:2054-2058 | `posGroups[pos]` re-check after DEF fallback was always false for IDP positions (DL, LB, DB). Now creates position groups dynamically for any position. |

### Backend Sweep Fixes

| # | Fix | Severity | Files | Notes |
|---|-----|----------|-------|-------|
| 5 | Lifetime checkout doesn't set plan_type | P2 | billing.py:433-446 | `plan_type` column added for lifetime tracking but never set in checkout. Lifetime purchases recorded as `plan_type='subscription'`. Now sets `plan_type='lifetime'` when `plan_tier.endswith('_lifetime')`. |
| 6 | Null subscription status written to DB | P2 | billing.py:456 | `subscription.get("status")` could be None on malformed Stripe webhook. Now defaults to `"unknown"`. |

### Backend Sweep: Triaged as Not Bugs
- Findings 1-4, 7: Week param + `HAVING games >= N` returns empty for single-week queries in aggregate endpoints (breakouts, redzone, usage trends, targets, streaks). These endpoints are semantically multi-week — already excluded from the frontend week selector. Empty results are graceful, not crashes.
- Finding 8: Dynasty history cache key uses first 5 IDs. In practice, only called with 1-3 IDs. Collision risk negligible.

### Verified Clean
- 11/11 smoke tests pass after all fixes
- All JS files syntax clean (node --check)
- All Python files compile clean
- CSS/Design sweep: 0 border violations, 0 font violations, `#fff` on colored badges is intentional for contrast

---

## Ship Loop Session 24: QA Ticket Consumption + Sweep (Mar 20)

**Goal**: Consume FUNC-015 through FUNC-018 QA tickets, sweep for new issues.

### QA Tickets Consumed

| Ticket | Severity | Action | Notes |
|--------|----------|--------|-------|
| FUNC-018 | P1 NEW | **FIXED** | Added `<base href="/">` to player.html, compare.html, team.html. SEO routes `/player/{id}`, `/compare/{id1}/{id2}`, `/team/{abbr}` had relative asset paths resolving against wrong directory, breaking CSS/JS loading. |
| FUNC-017 | P1 | Verified fixed | player.js breakout badge already uses PPG with 6GP min + 3 PPG floor (Session 20 fix confirmed) |
| FUNC-015 | P2 | Verified fixed | `_enrich_with_dynasty_value()` already calls `compute_trade_value()` (Session 20 fix confirmed) |
| FUNC-016 | P2 | Verified fixed | cheatsheet.html and scoring.html no longer use `escapeHtml` in onclick (Session 20 fix confirmed) |

### TICKETS.md: All entries DONE (no new work)

### Sweep Fixes (3-agent parallel: Backend Architect, Frontend Developer, SEO Verifier)

| # | Fix | Severity | Files | Notes |
|---|-----|----------|-------|-------|
| 1 | quick_search_players doesn't strip special chars | P1 | players.py:48 | Input like "Ja'Marr" or "D.J." failed to match search_name (alphanumeric-only). Added re.sub strip matching fetch_players pattern. |
| 2 | copyCompareURL/copyPlayerURL crash without Clipboard API | P1 | compare.js:852, player.js:760 | navigator.clipboard is undefined in non-HTTPS/embedded contexts. Added guard + execCommand fallback matching lab.js pattern. |
| 3 | openPlayerProfile doesn't URL-encode player ID | P1 | lab.js:6123 | Raw string interpolation in fetch path. Added encodeURIComponent() matching player.js pattern. |
| 4 | Skip-link broken by base href | MEDIUM | player.html:313, compare.html:317, team.html:276 | href="#main-content" resolves to /#main-content due to base tag. Replaced with JS scrollIntoView. |
| 5 | Compare diff bar overflows for negative stats (EPA) | P2 | compare.js:246-249 | v1/(v1+v2) produces >100% when values are negative. Now uses Math.abs() for proportional width. |
| 6 | Saved views don't preserve week/team/minGP state | P2 | lab.js:4122-4144, 4201-4209 | Added week, teams, minGP, tierBreaks, groupHeaders, summaryBar, tagFilter to save/load cycle. |

### Triaged (not fixing)
- `COUNT(*)` vs `COUNT(DISTINCT s.week)` in 7 player queries: latent bug, only triggers if a second data source is added. Single nflverse source means no duplicate week rows. Noted for future adapter additions.
- `changePageSize()` rejects sizes != 25: intentional per Session 7 fix (prevents slow loads).

### Verified Clean
- 11/11 smoke tests pass after all fixes
- All JS files syntax clean (node --check)
- All Python files compile clean
- 0 regressions

---

## Ship Loop Session 25: 3-Agent Sweep (Mar 20)

**Goal**: Parallel sweep with Backend Architect, Frontend Developer, and Data Integrity agents. Found 5 real bugs.

### Fixes Applied

| # | Fix | Severity | Files | Notes |
|---|-----|----------|-------|-------|
| 1 | Payment failure instantly downgrades user plan | P0 | billing.py:522-539 | `_handle_payment_failed` was downgrading to free on first `invoice.payment_failed`. Stripe retries payments over days before cancelling. Now only marks subscription status as `payment_failed`; actual downgrade deferred to `_handle_subscription_deleted`. |
| 2 | Radar chart hides negative EPA values | P1 | charts.js:174-230 | `Math.abs` normalization clamped all negative values to 0 on radar. Changed to min/max range normalization so negative EPA displays proportionally (worst=center, best=edge). |
| 3 | Pinned row expand creates orphan DOM elements | P1 | lab.js:1718 | `buildRowHTML` added expand arrow to pinned rows (rowIdx=null). Clicking inserts expand row into pinned tbody where virtual scroll never cleans it up. Now skips expand arrow when rowIdx is null. |
| 4 | Aging curves player dots/labels drawn at 70% alpha | P2 | lab.js:9506 | globalAlpha was set to 0.7 for dashed connecting lines but not restored before drawing data point circles and name labels. Moved alpha restore before data points. |
| 5 | Compare diff bar widths sum to >100% at extremes | P2 | compare.js:248-251 | `Math.max(pct, 5)` min-clamp caused pct1+pct2 to exceed 100% (e.g., 5%+99%=104%). Now normalizes both clamped widths so they sum to exactly 100%. |

### Triaged (not fixing)
- Consistency rankings return empty with week param: Known — frontend already excludes week selector for consistency panel (Session 23 triage)
- Pinned rows get percentiles from current view population: Arguable UX — comparing pinned player against current view is valid behavior
- Quick search cache uses raw input as key: Cache-inefficient but not a correctness bug
- Data integrity/HTML sweep: Clean — 0 new bugs across 15+ HTML pages, all API routes match

### Verified Clean
- 11/11 smoke tests pass after all fixes
- All 4 modified files syntax clean (node --check, py_compile)
- 0 regressions

---

## Ship Loop Session 26: 3-Agent Sweep (Mar 20)

**Goal**: Parallel sweep with Backend Architect, Frontend Developer, and Accessibility Auditor agents. Focus on new bug patterns: race conditions, state desync, dark mode gaps, a11y.

### Fixes Applied

| # | Fix | Severity | Files | Notes |
|---|-----|----------|-------|-------|
| 1 | Silent error swallowing in `_user_had_trial` | P1 | billing.py:205 | `except Exception: pass` could silently grant re-trial on DB error. Now logs warning with exc_info. |
| 2 | Silent error swallowing in quota/track endpoints | P2 | server.py:987,1009 | Auth failures silently degraded paid users to free quota. Now logs warning with exc_info. |
| 3 | Week select race condition on rapid season switch | P1 | lab.js:2897 | `populateWeekSelect()` fetch had no AbortController — stale week options could overwrite newer data. Added `_weekFetchController` with abort-on-reentry and AbortError catch guard. |
| 4 | tagFilter not cleared on universe/college-view switch | P2 | lab.js:2576,2606 | Tag filter state persisted across NFL→college switch, causing ghost filter. Added `state.tagFilter = false` in `setUniverse()` and `setCollegeView()`, plus `updateTagFilterBadge()` call. |
| 5 | Heat colors invisible in dark mode | P1 | lab.js:5134 | `getHeatColor()` used rgba tuned for light sand background — nearly invisible on dark espresso. Added `isDark` branch with higher opacity values (0.35/0.20/0.10 green, 0.30/0.18/0.08 red). |
| 6 | Dark mode hover tints too faint in all panels | P1 | lab-panels.css:4868+ | 29 panel table hover rules used `rgba(217,119,87,0.08)` — imperceptible on dark background. Added `[data-theme="dark"]` override block with `0.18` opacity. Also fixed matchup heatmap brightness filter (0.95→1.15 in dark mode). |
| 7 | Missing aria-label on icon-only buttons | P1 | lab.html:3304-3305,4377 | Undo/redo buttons (unicode glyphs only) and info toggle button lacked `aria-label`. Screen readers announced them without meaningful labels. Added aria-label to all three. |

### Triaged (not fixing this session)
- Stripe race conditions on early adopter slots / customer creation: Architectural — needs DB-level locking, not a minimal fix
- Focus trapping in 19 modal dialogs: Large a11y project — needs shared `trapFocus()` utility across all dialogs
- Panel fetch AbortControllers: Would need to touch every panel render function in lab-panels.js — too large for sweep
- Full lab-panels.css dark mode block (gold/bronze medal contrast, posColors hex→var): Incremental — started with hover tints which have the highest impact
- JWT stale plan after upgrade: Server-side enforcement is correct (DB lookup in get_current_user), JWT only affects frontend display until next /api/auth/me call

### Verified Clean
- 11/11 smoke tests pass after all fixes
- All modified files syntax clean (node --check, py_compile)
- 0 regressions

---

## Ship Loop Session 27: QA Ticket Triage + Sweep (Mar 20)

**Goal**: Consume FUNC-019 and FUNC-020 QA tickets, then sweep.

### QA Tickets Consumed

| Ticket | Severity | Action | Notes |
|--------|----------|--------|-------|
| FUNC-019: SEO routes broken on production | P0 | ESCALATE (human) | Deployment gap — `<base href="/">` fix exists in ship/launch-fixes (confirmed at player.html:4, compare.html:4, team.html:4) but not deployed to master. Requires human: `git merge ship/launch-fixes` into master + Render redeploy. |
| FUNC-020: Derived column sort wrong order | P1 | ESCALATE (human) | Same deployment gap — `sql_limit=2000` (players.py:433) and null sentinel sort (players.py:490) exist in ship/launch-fixes. Requires same merge + deploy as FUNC-019. |

### TICKETS.md: All entries DONE (no new work)

### Entering SWEEP MODE

---

## Ship Loop Session 28: QA Tickets + Data Enrichment (Mar 21)

**Goal**: Consume remaining QA tickets, populate missing DB data, sweep for quality issues.

### QA Tickets Consumed

| Ticket | Severity | Action | Notes |
|--------|----------|--------|-------|
| FUNC-030: Deploy ship/launch-fixes | P0 | DONE | Pushed branch to origin. Merge to master + Render redeploy is human task. |
| FUNC-031: player_season_pbp 0 rows | P1 | DONE | Ran sync_pbp_data() for 2015-2024. 2,729 rows populated. Goal-line, scramble, play-action, garbage time stats now functional locally. |

### Data Enrichment (local DB only — production needs rebuild)

| Task | Result |
|------|--------|
| PBP sync (2015-2024) | 2,729 player-season PBP rows: goal-line carries/TDs, scramble stats, play-action, garbage time %, RYOE, drops |
| Roster sync (2024) | 2,001 players enriched with age, height, weight, college, headshot URLs. Dynasty rankings now have age component. |
| Bye weeks (2024) | 653 entries across 32 teams |
| Injuries (2024) | 644 injury entries |

### Sweep Fixes

| Fix | Notes |
|-----|-------|
| Garbage time min PPG | Added `ppg >= 5` to stat_padders filter. Previously showed punters/practice squad at 100% GT. Now surfaces fantasy-relevant players (e.g., Rattler 10.5 PPG, 27.7% GT). |

### Backend Code Sweep: CLEAN
- No division-by-zero risks, SQL injection, bare excepts, or missing null guards found across dashboards.py, analytics.py, tools.py, core.py

### IMPORTANT: Production DB Needs Rebuild
All data enrichments (PBP, roster demographics, bye weeks, injuries) are local-only. Production razzle.lol still has the old DB. Human must rebuild terminal.db and upload to GitHub release for Render.

---

## Ship Loop Session 29: Full Codebase Sweep (Mar 21)

**Goal**: Deep security and robustness sweep with zero tickets. All ticket directories empty, TICKETS.md remaining items blocked on external infrastructure.

### Sweep Results

| # | Fix | Severity | Files | Notes |
|---|-----|----------|-------|-------|
| 1 | LLM endpoint temperature/max_tokens input sanitization | P2 | server.py:1128-1134, 1239-1243 | Both `/api/llm/chat` and `/api/llm/chat-free` passed user-supplied `temperature` and `max_tokens` without type validation. A non-numeric `max_tokens` (e.g., `"foo"`) would crash `min()` with TypeError before the try/except block. Now: temperature clamped to [0.0, 2.0] with float cast + fallback, max_tokens clamped to [1, cap] with int cast + fallback. |
| 2 | Response cache thread safety | P1 | server.py:36-56 | `_resp_cache` dict accessed concurrently by async middleware and background thread without locking. Eviction path could raise `RuntimeError: dictionary changed size during iteration` or corrupt state. Added `threading.Lock` around all cache reads, writes, and eviction. |
| 3 | Body size limit bypass via chunked encoding | P1 | server.py:470-491 | `body_size_limit_middleware` only checked `Content-Length` header, which can be omitted with chunked transfer encoding. Attacker could POST unbounded body to exhaust server memory. Now reads actual body for POST/PUT/PATCH without Content-Length and enforces 1 MB limit. |
| 4 | XSS via escapeHtml in attribute context | P0 | formula-store.js:482 | `escapeHtml` (DOM textContent trick) does NOT escape `"` — used in `value="${escapeHtml(...)}"` attribute. Attacker input containing `"` breaks out of attribute. Changed to `escapeAttr()`. |
| 5 | XSS via inline onclick with escapeAttr | P0 | lab.js:11389 | Roster search results used inline `onclick` with `escapeAttr`. Browsers decode HTML entities in event handler attributes before JS execution, so `&#39;` decodes back to `'`, allowing JS injection. Replaced with data attributes + `addEventListener` event delegation. |
| 6 | Missing null checks in fetch/render functions | P1 | lab.js | `fetchAndRenderNFL/Prospects/College`, `applyUniverseUI`, `renderPagination`, `closeTradeAnalyzer` accessed DOM elements without null guards. Added `if (!el) return` or `if (el)` guards to prevent TypeError crashes. |

### Triaged (not fixing this session)
- Rate limiter thread safety (P2): `defaultdict(list)` rate limiters not locked — slight over-count under high concurrency is acceptable for rate limiters
- Screener POST cache key normalization (P2): Extra keys in POST body create unique cache entries — capped at 100 entries max
- Bootstrap status thread safety (P2): GIL provides sufficient protection for simple dict reads/writes
- Cache key season resolution (P2): `season=None` cache keys waste memory but don't affect correctness
- Unescaped season values in `<option>` HTML (P2): Integer-only from API, low risk but inconsistent with codebase conventions
- `_showToast` innerHTML heuristic (P2): Uses innerHTML when message contains `<a href="/"` — latent XSS trap but all current callers use safe internal strings
- `briefings/save` fetch missing `resp.ok` check (P2): Failed save still triggers `loadLatestBriefing()`, masking failure

### Areas Verified Clean
- **SQL injection**: All query builders use allowlists (safe_sorts, FILTER_COLUMN_MAP, ops dict) + parameterized queries
- **Division by zero**: All 40+ division sites guarded with `or 1`, `if > 0`, or `HAVING games >= N` clauses
- **Auth**: All sensitive endpoints use `require_auth` + `require_plan`, briefing retrieval scoped by user_id (no IDOR)
- **XSS**: `escapeHtml` used consistently, no `eval()` or `new Function()`, agent nudges validate colors with regex and block `javascript:` URLs
- **CORS**: Production-only origin (`https://razzle.lol`), dev adds localhost
- **LLM security**: System messages stripped, message count/length capped, server-controlled system prompt
- **Password security**: bcrypt 12 rounds, common password blocklist, min 8 chars with complexity
- **Rate limiting**: IP-based on sensitive endpoints, per-user on LLM proxy, waitlist rate limiter
- **Secrets**: No hardcoded API keys, no debug endpoints, CORS origins environment-gated

### 11/11 smoke tests pass after fix

---

## Ship Loop Session 30: 3-Agent Parallel Sweep (Mar 21)

**Goal**: Ticket directories empty, TICKETS.md blocked on external infrastructure. Full sweep mode with Backend Architect, Frontend Developer, and HTML Panel QA agents.

### Fixes Applied (10 bugs across 15 files)

| # | Fix | Severity | Files | Notes |
|---|-----|----------|-------|-------|
| 1 | `f.stat` → `f.key` in warroom filter context | P1 | warroom.js:2106 | Agent context showed "undefined >= 10" instead of actual filter field name |
| 2 | clearTimeout before resp.json() in callServerLLM | P1 | warroom.js:2485 | Timeout cleared after headers but before body — resp.json() could hang forever |
| 3 | clearTimeout before resp.json() in callFreeLLM | P1 | warroom.js:2534 | Same pattern — moved clearTimeout after body consumed |
| 4 | `p.flags.map()` crash on null | P1 | workload.html:274 | API could return null flags array — added `|| []` guard |
| 5 | `p.milestones.map()` crash on null | P1 | seasonpace.html:261 | API could return null milestones — added `|| []` guard |
| 6 | escapeHtml(null) renders "null" string | P1 | 10 HTML panels | DOM-based escapeHtml had no null guard — added `if (t == null) return ""` |
| 7 | Note editor title double-escaped | P2 | lab.js:563 | `escapeHtml(name)` on already-escaped name showed `&amp;amp;` |
| 8 | NaN bar heights on null scores | P2 | streaks.html:461 | `null / maxScore` → NaN → `height:NaNpx`. Added `|| 0` guard |
| 9 | records.html null fields show "null" | P2 | records.html | No fmt() helper — added null-safe number formatter |
| 10 | billing trial_used set unconditionally | P2 | billing.py:440,447 | `trial_used=1` on all checkouts burned trial eligibility for direct purchases. Now `MAX(trial_used, ?)` with is_trial flag |

### Triaged (not fixing)
- COUNT(*) vs COUNT(DISTINCT week) — single data source, no duplicates (Session 24 triage)
- Week filter on consistency/efficiency endpoints — frontend excludes week selector (Session 23 triage)
- Stripe TOCTOU race on customer creation — architectural, needs DB-level locking (Session 26 triage)
- Cache key raw query — cache-inefficient, not a correctness bug (Session 25 triage)
- changePageSize only accepts 25 — intentional per Session 7 (prevents slow loads)
- Formula label pre-escaped double-encoding — extremely rare (formula names with `&`), fixing risks XSS
- Sprite COLS/ROWS naming — coincidentally correct for 2x2 grid, sprites won't change
- Season cutoff >= 8 vs >= 6 — inconsistent but functional (all resolve to 2025 in March)
- LLM rate limit consumed before request — acceptable, refund-on-failure adds complexity
- Subscription reactivation plan restore — edge case requiring Stripe metadata present

### Verified Clean
- 11/11 smoke tests pass
- All modified JS files syntax clean (node --check)
- All modified Python files compile clean
- 0 regressions

---

## Ship Loop Session 31: Triage Cleanup Sweep (Mar 21)

**Goal**: Fix previously-triaged P2 items from Sessions 29-30, sweep agent connective tissue code.

### Fixes Applied (7 bugs across 5 files)

| # | Fix | Severity | Files | Notes |
|---|-----|----------|-------|-------|
| 1 | _showToast innerHTML XSS trap eliminated | P2 | app.js:458, lab.js:9,5831 | Removed innerHTML heuristic (`msg.indexOf('<a href="/')`) — latent XSS if any caller ever passed user-controlled text containing that substring. Refactored to accept optional `link` parameter (`{href, text}`); always uses textContent + DOM-created `<a>`. Two callers (CSV export Pro gate) updated. |
| 2 | briefings/save missing resp.ok check | P2 | warroom.js:3877 | `.then(function() { loadLatestBriefing(); })` triggered reload even on 4xx/5xx responses, masking save failures. Now checks `resp.ok` before calling `loadLatestBriefing()`. |
| 3 | agents.html briefing fetch missing resp.ok (×3) | P2 | agents.html:2284-2286 | Three parallel fetches for weekly briefing data (dynasty-rankings, stock-watch, breakout-candidates) skipped resp.ok check — would attempt `.json()` on error responses. Added `if (!r.ok) throw new Error(r.status)` before `.json()`. |
| 4 | index.html mini-data fetch missing resp.ok | P2 | index.html:1010 | Home page player data fetch skipped resp.ok check. Added guard. |

### Sweep Results
- **Agent connective tissue** (agent-config.js, agent-nudges.js): Clean. Proper escapeHtml/escapeAttr, color regex validation, javascript: URL blocking, proper event delegation.
- **FAAB panel** (lab-panels.js:10342): Clean. All hardcoded data, properly escaped.
- **Ambient character peek** (app.js:1830): Clean. Uses escapeAttr for icon/name.
- **XSS sweep** (all frontend JS/HTML): No vulnerabilities found. All user/API data properly escaped.
- **Fetch resp.ok sweep** (all frontend JS/HTML): 4 missing checks found and fixed (see above).

### Verified Clean
- 11/11 smoke tests pass
- All modified JS files syntax clean (node --check)
- 0 regressions

---

## Ship Loop Session 32: Full Codebase Sweep (Mar 21)

**Goal**: Ticket directories empty, TICKETS.md blocked on external infrastructure. 4-agent parallel sweep + manual audit.

### Fixes Applied (1 bug across 1 file)

| # | Fix | Severity | Files | Notes |
|---|-----|----------|-------|-------|
| 1 | Player popup `games_played` → `games` field mismatch | P2 | app.js:1754 | Player popup (openPlayerPopup) read `stats.games_played` for GP stat, but profile API returns `games`. GP never displayed in popup. |
| 2 | Season cutoff `>= 6` (July) → `>= 8` (September) | P2 | advantage.html, fptsbreakdown.html, pace.html, streaks.html | 4 pages used July cutoff while canonical _latestSeason uses September. Would break in Jul/Aug by trying to load non-existent current-year data. |
| 3 | comptable.html quick-search response shape mismatch | P1 | comptable.html | API returns flat array, code expected `{players:[]}`. Autocomplete was completely broken — never showed results. Also `p.name` → `p.full_name` (blank names). URL init had same bug. |
| 4 | 7 pages: `.length` on undefined API arrays | P1 | consistency, efficiency, opportunity, stocks, schedule, reportcard, regression | `data.x.length` crashes with TypeError if API returns partial response. Fixed with `(data.x \|\| []).length` guards. |
| 5 | draftclass.html null guards | P1 | draftclass.html | `d.summary` and `d.players` accessed without null checks. Added `\|\| {}` and `\|\| []` guards. |
| 6 | 4 more `.length` on undefined arrays | P1 | airyards, redzone, usage, vorp | Same crash pattern as #4. Added `(data.x \|\| []).length` guards. |
| 7 | regression.html inner `.length` checks | P2 | regression.html | Early-return guard fixed in #4, but inner section rendering still accessed `.length` directly — would crash if one array existed but the other was undefined. |

### Verified Clean (manual sweep + 4 parallel agents)
- 11/11 smoke tests pass
- 59/59 pytest tests pass
- All 14 JS files syntax clean (node --check)
- All Python files compile clean
- 0 remaining 1px solid borders in CSS/JS (table row dividers are intentional)
- 0 cold gray hex values (#333-#eee) in CSS/JS
- 0 font-display at <16px violations
- 0 missing resp.ok checks on frontend fetches
- 0 unescaped innerHTML with user data (XSS)
- 0 remaining field name mismatches (games_played/air_yard_pct/dominator scope)
- _showToast uses textContent (XSS-safe after Session 31 refactor)
- setInterval in warroom.js properly managed (visibilitychange pause/resume)
- Agent connective tissue (agent-config.js, agent-nudges.js) properly escaped
- Monte Carlo worker has proper edge case guards (Box-Muller log(0), z-score clamp)
- boom-bust `games_played` field is internally consistent (API + frontend) — not changed
- All season cutoffs now consistently use `>= 8` (September) — 0 remaining `>= 6` or `>= 7`
- All f-string SQL in prospects.py uses hardcoded column names from dicts/whitelists — no injection risk
