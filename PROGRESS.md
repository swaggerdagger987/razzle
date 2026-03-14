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

### Sweep Mode (Mar 14)

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
