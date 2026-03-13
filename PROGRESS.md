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
| D-2 | Agent execution QA | | |
| D-3 | Cross-agent triggers | | |
| D-4 | Context bridge verification | | |
| D-5 | Pixel canvas performance | | |
| D-6 | "What can I ask?" panel | | |
| D-7 | Error handling | | |
| D-8 | BYOK cloud sync | | |

### Decisions Log

---
