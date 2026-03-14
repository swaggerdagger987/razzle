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
