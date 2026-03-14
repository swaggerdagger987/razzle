# Razzle Loop — Ticket Queue

> Drop phase specs here. The loop checks this file before auto-generating its next phase.
> When a ticket is consumed, it gets deleted from this file.
> Format: each ticket is a full phase spec (same format as LOOP-TASKS.md).
> Multiple tickets = multiple phases, executed in order (first one becomes next phase).

---

## IMPORTANT: DO NOT re-upload terminal.db

The database file `data/terminal.db` uses WAL journal mode locally. Uploading it directly to GitHub releases produces a corrupt file because the WAL journal data is not included. **Never run `gh release upload` with `data/terminal.db`**. The clean version (`data/terminal_clean.db`, created with `VACUUM INTO`) is the only file that should be uploaded. A human handles DB uploads manually.

---

---

## Phase: Review Fix 3 — CSS & Design System Cleanup

**Exit Criterion**: Zero undefined CSS variables. Zero cold grays. All hardcoded position colors use CSS variable tokens. 1px table borders upgraded to 2px. Canvas charts use Razzle fonts. Dark mode renders correctly for all components.

### Task 1: Fix undefined CSS variables in lab-panels.css

**File**: `frontend/lab-panels.css`

Find and replace all undefined CSS variables with correct tokens:
- `var(--accent)` → `var(--orange)` (5 occurrences at lines ~283, 340, 502, 507, 520)
- `var(--bg-main)` → `var(--bg-warm)` (2 occurrences at lines ~284, 306)
- `var(--border-light)` → `var(--ink-faint)` (2 occurrences at lines ~312, 374)

Also fix in `frontend/styles.css`:
- `var(--font-data)` → `var(--font-mono)` (line ~1213)

Also fix in `frontend/lab-panels.js` and `frontend/lab.js`:
- `var(--accent)` → `var(--orange)` wherever used in inline styles for sparkline colors

**Why**: These variables are never defined in `:root`. Components using them have broken/missing styles in production right now.

**Acceptance**: Zero references to `--accent`, `--bg-main`, `--border-light`, or `--font-data` remain anywhere in the codebase. All replaced with defined tokens. Visual appearance is correct.

---

### Task 2: Replace cold grays with warm Razzle equivalents

**Files**: `frontend/lab-panels.css`, `frontend/gamescript.html`, `frontend/comptable.html`, `frontend/gamelog.html`, `frontend/records.html`, `frontend/weeklyleaders.html`, `frontend/compare.js`, `frontend/player.js`

Replace all cold gray hex values with warm equivalents:
- `#e5e7eb` → `var(--bg-warm)` (Tailwind gray-200)
- `#f3f4f6` → `var(--bg-card)` (Tailwind gray-100)
- `#374151` → `var(--ink-medium)` (Tailwind gray-700)
- `#6b7280` → `var(--ink-light)` (Tailwind gray-500)
- `#9ca3af` → `var(--ink-faint)` (Tailwind gray-400)
- `#3a3a3a` → `var(--ink)` (dark cold gray in table hovers)
- `#808080` → `var(--ink-light)` (pure gray for silver badges)
- `#c0c0c0` → `var(--ink-faint)` (silver gray)
- `#2a2a2e` → `var(--ink)` or `#2d1f14` (blue-black in canvas charts)
- `#6b6b7b` → `var(--ink-light)` or `#8a7565` (cold gray labels in canvas)
- `#eee` → `var(--bg-warm)` (in lab-panels.js inline styles)
- `#333`, `#444`, `#555`, `#666`, `#888`, `#aaa`, `#ccc`, `#ddd` in `warroom.js` — leave these alone (pixel art exception per design guide)

**Why**: Design guide explicitly says "Cold grays anywhere — even dark mode stays warm (brown, not gray)." These are Tailwind defaults that leaked in during development.

**Acceptance**: Zero cold gray hex values in any CSS or HTML file (except warroom.js pixel art). All replaced with warm CSS variable tokens. Grep for `#e5e7eb|#f3f4f6|#374151|#6b7280|#9ca3af|#3a3a3a|#808080|#c0c0c0|#2a2a2e|#6b6b7b` returns zero results outside warroom.js.

---

### Task 3: Define semantic color tokens for positive/negative states

**File**: `frontend/styles.css`

Add to `:root` (after the existing accent colors):
```css
--semantic-green: #2e7d52;
--semantic-green-light: #e8f0e4;
--semantic-red: #9b3232;
--semantic-red-light: #f0e0df;
```

Add to `[data-theme="dark"]`:
```css
--semantic-green: #5cb87a;
--semantic-green-light: #1a3325;
--semantic-red: #e06060;
--semantic-red-light: #3d1f1f;
```

Then replace across `frontend/lab-panels.css` and HTML files:
- `#166534` → `var(--semantic-green)` (Tailwind green-800, ~35 occurrences)
- `#991b1b` → `var(--semantic-red)` (Tailwind red-800, ~30 occurrences)
- `#dcfce7` → `var(--semantic-green-light)` (~25 occurrences)
- `#fee2e2` → `var(--semantic-red-light)` (~20 occurrences)
- `#fef2f2` → `var(--semantic-red-light)` (~10 occurrences)
- `#d44040` → `var(--red)` (custom red, ~15 occurrences)

**Why**: These Tailwind green/red values are hardcoded across 100+ locations. They don't shift in dark mode. Defining warm-shifted semantic tokens fixes dark mode and brand consistency in one pass.

**Acceptance**: New semantic tokens defined in both light and dark mode. Zero hardcoded Tailwind green/red hex values remain. Dark mode positive/negative colors render correctly.

---

### Task 4: Upgrade 1px table borders to 2px dashed

**File**: `frontend/lab-panels.css`

Find all instances of `border-bottom: 1px solid var(--ink-faint)` on table cells and list rows (56 occurrences across lines 568-3603). Replace with `border-bottom: 2px dashed var(--ink-faint)`.

**Why**: Design guide says "Dashed dividers: 2px dashed var(--ink-faint) inside cards" and "Don't: Thin 1px borders on primary elements."

**Acceptance**: Zero `1px solid var(--ink-faint)` on table/list row borders in lab-panels.css. All upgraded to `2px dashed var(--ink-faint)`.

---

### Task 5: Replace sans-serif with Razzle fonts in canvas rendering

**Files**: `frontend/lab.js`, `frontend/charts.js`, `frontend/player.js`, `frontend/compare.js`

Find all canvas `ctx.font` assignments that use bare `sans-serif` (121 total: 107 in lab.js, 5 in charts.js, 4 in player.js, 5 in compare.js).

Replace based on context:
- Chart titles, axis labels, player names → `'Luckiest Guy', cursive`
- Data values, stat numbers, percentages → `'Space Mono', monospace`
- Annotations, notes → `'Caveat', cursive`

When unsure, use `'Space Mono', monospace` for numbers and `'Luckiest Guy', cursive` for text labels.

**Why**: Every exported chart/screenshot renders in the browser's default sans-serif instead of Razzle fonts. Charts are the most screenshot-worthy content. Wrong fonts destroy brand identity.

**Acceptance**: Zero instances of bare `sans-serif` in any canvas font assignment. All use one of the three Razzle font families.

---

### Task 6: Remove Garfield from font declaration

**File**: `frontend/styles.css`

Find `--font-display: 'Garfield', 'Luckiest Guy', cursive;` (line ~46). Change to `--font-display: 'Luckiest Guy', cursive;`.

**Why**: "Garfield" font is never loaded — no @font-face, no Google Fonts import, no font file. It silently fails on every page.

**Acceptance**: No reference to "Garfield" font in any CSS or JS file.

---

## Phase: Review Fix 4 — Frontend Code Quality & Bug Fixes

**Exit Criterion**: No event listener leaks. No function name collisions with native APIs. Lifetime plan subscribers have full access. localStorage parsing is crash-safe. All toasts work correctly.

### Task 1: Fix event listener leak in updateAuthUI

**File**: `frontend/app.js`

Find the `updateAuthUI(user)` function (line ~490+). Inside it, a `document.addEventListener("click", function _closeDropdown(e) {...})` is added every time the function is called. This leaks listeners.

Fix: Move the dropdown close handler to module level. Add it once during `initAuth()`, not on every auth state change.

```javascript
// At module level, near top of app.js
var _dropdownCloseHandler = function(e) {
    var dd = document.querySelector(".nav-user-dropdown");
    if (dd && !dd.contains(e.target)) dd.classList.remove("open");
};
```

In `initAuth()`, add it once: `document.addEventListener("click", _dropdownCloseHandler);`

Remove the `document.addEventListener("click", function _closeDropdown...)` from inside `updateAuthUI`.

**Why**: Every auth state change (login, page load, plan change) adds a new anonymous click listener that is never removed. Over a session, this accumulates unbounded listeners.

**Acceptance**: Only one dropdown close listener exists on document. `updateAuthUI` does not add event listeners.

---

### Task 2: Consolidate _showToast — remove duplicate from lab.js

**File**: `frontend/lab.js`

Find the `_showToast` function in `lab.js` (line ~150). Delete it entirely. The `app.js` version (line ~140) already handles `type` and `duration` parameters and is the canonical version. Since `app.js` loads before `lab.js`, the app.js version will be available.

Also fix all callers in lab.js that pass HTML in toast messages (e.g., line ~11 with the upgrade link). Since `_showToast` uses `textContent`, HTML won't render. Either:
- Change the upgrade prompt to use a different mechanism (a banner div, not a toast), or
- Change those specific calls to plain text: `_showToast('CSV export requires Pro. Visit the pricing page to upgrade.', 'warning')`

**Why**: lab.js version silently overwrites app.js version, breaking toast styling (no type/duration support). HTML in textContent renders as literal tags.

**Acceptance**: Only one `_showToast` function exists (in app.js). No toast callers pass HTML strings. Toast type styling (warning/error borders) works on Lab page.

---

### Task 3: Fix lifetime plan checks — use isPaidUser() consistently

**File**: `frontend/lab.js`

Find all inline plan checks that miss lifetime variants. At minimum:
- Line ~10 and ~5484: CSV export gating that checks `plan !== "pro" && plan !== "elite"` but misses `pro_lifetime` and `elite_lifetime`.

Replace all inline plan checks with calls to `isPaidUser()` (from app.js) or `isEliteUser_global()` (from app.js) which correctly handle all plan variants including lifetime.

Search the entire file for `user.plan` and `plan !==` to find all instances.

**Why**: Lifetime subscribers ($399.99) are blocked from CSV export because the inline check doesn't recognize their plan string.

**Acceptance**: Zero inline plan string comparisons in lab.js. All use `isPaidUser()` or `isEliteUser_global()` from app.js.

---

### Task 4: Fix localStorage null handling — add crash-safe parsing

**Files**: `frontend/lab.js`, `frontend/warroom.js`

Find all `JSON.parse(localStorage.getItem("razzle_user"))` calls that have no fallback:
- `lab.js` line ~9 and ~5483
- `warroom.js` line ~1913 and ~1921

Wrap each in a try-catch with a null fallback:
```javascript
var user = null;
try { user = JSON.parse(localStorage.getItem("razzle_user") || "null"); } catch(e) { user = null; }
```

**Why**: If localStorage is corrupt or contains invalid JSON, `JSON.parse` throws and halts script execution. Inconsistent — some call sites already use fallbacks, others don't.

**Acceptance**: Every `JSON.parse(localStorage.getItem(...))` call in the codebase is wrapped in try-catch. Zero risk of crash from corrupt localStorage.

---

### Task 5: Move CREATE TABLE IF NOT EXISTS from per-request to init

**File**: `backend/auth.py`

Find all functions that execute `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS` on every call:
- `get_saved_views()` (line ~486)
- `get_watchlist()` (line ~551)
- `sync_watchlist()` (line ~564)
- `get_briefing_history()` (line ~738)
- `save_briefing()` (line ~776)
- `get_memory_entries()` (line ~814)

Move all these DDL statements into the `initialize_users_db()` function (line ~60+) where the other tables are created. Remove the DDL from the individual functions.

**Why**: Every API call to these endpoints runs DDL unnecessarily. While SQLite handles it cheaply, it adds overhead on hot paths and clutters the code.

**Acceptance**: `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS` only appear in `initialize_users_db()`, not in individual query functions. Tests pass.

---

## Phase: Review Fix 5 — Brand Voice & Personality

**Exit Criterion**: Zero generic error/empty/loading states. All user-facing text has Razzle personality. Brand consistency score moves from 82 to 92+.

### Task 1: Create shared error/empty state vocabulary

**File**: `frontend/app.js`

Add a shared function at module level that returns randomized brand-flavored messages:

```javascript
var RAZZLE_ERRORS = [
    "fumbled the data fetch... try again in a sec",
    "film room's dark right now — give it another shot",
    "the tape machine jammed. Razzle's on it",
    "interception on that request. retry?",
    "false start on the server. try refreshing",
    "delay of game — something went sideways"
];

var RAZZLE_EMPTY = [
    "nobody home for this filter",
    "the film room's empty. adjust your filters",
    "zero matches — either your standards are elite or your filter's off",
    "Razzle checked everywhere. nothing matches",
    "clean pocket, no receivers open. try different filters"
];

function razzleError() { return RAZZLE_ERRORS[Math.floor(Math.random() * RAZZLE_ERRORS.length)]; }
function razzleEmpty() { return RAZZLE_EMPTY[Math.floor(Math.random() * RAZZLE_EMPTY.length)]; }
```

**Acceptance**: Functions `razzleError()` and `razzleEmpty()` exist in app.js and return randomized brand-flavored messages.

---

### Task 2: Replace generic error states across all Lab panels

**Files**: All panel HTML files in `frontend/`, `frontend/lab-panels.js`, `frontend/lab-mockdraft.js`, `frontend/lab-prospect-radar.js`

Search for all error messages that say "failed to load", "error loading", "couldn't load", or expose `err.message` / `err` to the user. Replace with calls to `razzleError()`.

For error states that currently expose raw error objects, log the real error to console and show the brand message to the user:
```javascript
.catch(function(err) {
    console.error('Panel load error:', err);
    container.innerHTML = '<p style="...">' + razzleError() + '</p>';
});
```

Do NOT expose `err.message`, HTTP status codes, or technical details to the user.

**Why**: Error states are high-frequency user touchpoints. 30+ panels show "failed to load air yards data" style messages. The 404 page proves Razzle can do better ("This page got cut from the roster").

**Acceptance**: Zero instances of "failed to load" or raw error objects shown to users. All error states use `razzleError()` or custom brand-flavored text. Real errors logged to console.

---

### Task 3: Replace generic empty states across all Lab panels

**Files**: All panel HTML files in `frontend/`, `frontend/lab-panels.js`

Search for all empty state messages like "no players found", "no data found", "no results", "no matches". Replace with calls to `razzleEmpty()` or contextual brand-flavored text.

For the screener main empty state (which already has a tiger emoji and is decent), keep the existing treatment but add variety — use `razzleEmpty()` for the main message text.

**Why**: Empty states are moments to reinforce the brand. "no players found for this filter" reads like a database query, not a product with personality.

**Acceptance**: Zero generic "no data found" or "no players found" messages. All empty states use `razzleEmpty()` or custom personality text.

---

### Task 4: Diversify loading states — 15-20 rotating messages

**Files**: `frontend/app.js`, `frontend/lab.js`, `frontend/lab-panels.js`, `frontend/league-intel.html`

Add a shared loading message function to `app.js`:

```javascript
var RAZZLE_LOADING = [
    "pulling film...",
    "checking the tape...",
    "running the numbers...",
    "consulting the analytics department...",
    "cross-referencing the scouting reports...",
    "Razzle's reviewing game tape...",
    "scanning the waiver wire...",
    "breaking down the all-22...",
    "crunching the combine data...",
    "studying the matchup charts...",
    "reviewing snap counts...",
    "calculating trade values...",
    "processing the depth chart...",
    "scouting the next breakout...",
    "analyzing target shares..."
];

function razzleLoading() { return RAZZLE_LOADING[Math.floor(Math.random() * RAZZLE_LOADING.length)]; }
```

Replace all hardcoded "pulling film..." instances with calls to `razzleLoading()`. Each loading state should show a different message.

**Why**: "pulling film..." is repeated 10+ times and becomes invisible wallpaper. Rotating messages keep the brand voice alive.

**Acceptance**: `razzleLoading()` function exists with 15+ messages. Zero hardcoded loading strings remain. Each panel load shows a randomized message.

---

### Task 5: Replace generic Bureau error/empty states with intel-flavored text

**File**: `frontend/league-intel.html`

Replace Bureau-specific messages with intelligence bureau themed text:
- "couldn't find that username on Sleeper" → "agent not found in the field. check the callsign and try again"
- "no leagues found for this season" → "no active operations this season. try a different year"
- "no rosters found for this league" → "intel report came back empty. roster data unavailable"
- "no transactions found yet" → "no chatter on the wire yet. check back during the season"
- "no players found on rosters" → "the roster is classified — or empty"
- "no strong trade matches found" → "the Diplomat found no viable angles in this league"

**Why**: The Bureau of Intelligence should sound like an intelligence bureau, not a database query. The brand identity is "your league. their weaknesses." — the language should match.

**Acceptance**: All Bureau error/empty states use intel-themed language. Zero generic "no X found" messages remain in league-intel.html.

---

### Task 6: Fix pricing page copy and og:description

**File**: `frontend/pricing.html`

1. Change the h1 from "Pick Your Plan" to "Pick Your Playbook" (or similar brand-flavored alternative).
2. Change the og:description (line ~8) from "Razzle Pro and Elite plans. AI agents with league context, cloud sync, full historical data, and more." to "Free forever Lab. Pro unlocks the Bureau of Intelligence. Elite gets the full war machine — six AI agents who know your league."
3. Change the trial banner copy from "Try Pro Free for 7 Days" / "No credit card required..." to "7 days of Pro. On the house." / "Full access. No card. Just sign up and start pulling film."

**Why**: Pricing page is the conversion page. "Pick Your Plan" and "and more" are generic SaaS copy. The rest of the site has real personality — the pricing page should too.

**Acceptance**: No generic SaaS copy remains on pricing page. h1, og:description, and trial banner all use Razzle voice.

---

## Phase: Lab Backend Performance Hardening

**Exit Criterion**: Screener API response < 200ms for typical queries. Enrichment queries batched. Database indexes optimized. No API contract changes. All 59 existing tests pass (`python -m pytest tests/ -v`).

### Task 1: Add missing database indexes

**File**: `adapters/nflverse_adapter.py`

In the `initialize_database()` function, find the index block after the `player_week_metrics` table definition (line ~218-219). After the existing two indexes (`idx_pwm_key_val`, `idx_pwm_player`), add:

```sql
CREATE INDEX IF NOT EXISTS idx_pwm_player_key ON player_week_metrics(player_id, stat_key);
CREATE INDEX IF NOT EXISTS idx_pwm_season_player ON player_week_metrics(season, player_id);
```

Also after the `player_week_stats` indexes (line ~202-204), add:

```sql
CREATE INDEX IF NOT EXISTS idx_pws_player_season_ppr ON player_week_stats(player_id, season, fantasy_points_ppr);
```

Also after the `players` table indexes (line ~148-151), add:

```sql
CREATE INDEX IF NOT EXISTS idx_players_pos_relevant ON players(position, fantasy_relevant);
```

**Acceptance**: All 4 new `CREATE INDEX IF NOT EXISTS` statements present. Tests pass.

---

### Task 2: Reduce over-fetch in _enrich_with_pbp_stats (SELECT * removal)

**File**: `backend/live_data/core.py`

In `_enrich_with_pbp_stats()` (line ~491), the non-career branch uses `SELECT * FROM player_season_pbp`. Replace with an explicit column list matching the `pbp_cols` consumed downstream (plus `player_id`).

**Acceptance**: `SELECT *` replaced with explicit columns. Tests pass.

---

### Task 3: Reduce 5x over-fetch multiplier for post-filters

**File**: `backend/live_data/players.py`

In `_fetch_screener_uncached()` (line ~404), change `sql_limit = limit * 5` to use a dynamic multiplier: 2x for single filter, 3x for multiple filters.

**Acceptance**: Multiplier is 2 for single filter, 3 for multiple. Tests pass.

---

### Task 4: Add Cache-Control headers for static assets and screener endpoints

**File**: `backend/server.py`

1. Add middleware or modify the static file mount to set `Cache-Control: public, max-age=31536000, immutable` for `.js`, `.css`, `.png`, `.svg`, `.woff2` files.
2. Add `Cache-Control: public, max-age=60` response headers to the screener POST endpoints (query and sparklines) using `JSONResponse`.
3. Move Google Fonts from CSS `@import` (styles.css line 2) to `<link rel="stylesheet">` in the HTML `<head>` of all pages (or self-host the fonts). Remove the `@import` line.

**Acceptance**: Static assets have long cache headers. Screener responses have 60s cache. Google Fonts loaded via `<link>` not `@import`. Tests pass.

---

## Phase: Lab Frontend Performance Hardening

**Exit Criterion**: Lab initial render < 500ms for 1000-row dataset. Sort/filter feels instant. Scroll is jank-free. Zero functionality or visual changes.

### Task 1: Lazy virtual scroll row building

**File**: `frontend/lab.js`

In `renderTableBody()` (~line 1877-1893), change from pre-building HTML for ALL rows to lazy building. Make `_vscrollRows` a sparse array. Only build HTML for visible rows + buffer (~10 above/below). Cache built rows for reuse.

**Acceptance**: Initial render builds ~50-70 rows max. All sorting, filtering, heat colors, data bars still work.

---

### Task 2: Set-based selection and watchlist lookups

**File**: `frontend/lab.js`

Replace `.some()` membership checks with `Set.has()` for selected players and watchlist. Maintain shadow `Set` objects alongside the arrays.

**Acceptance**: Zero `.some()` calls for selection/watchlist during row rendering. All UI behavior unchanged.

---

### Task 3: Client-side screener query cache

**File**: `frontend/lab.js`

Add 5-entry in-memory cache keyed by `JSON.stringify(requestBody)`. Return cached results for identical queries. Clear on universe change.

**Acceptance**: Repeat queries return cached data. Visual mode toggles don't re-fetch. Max 5 entries.

---

### Task 4: Debounce filter inputs

**File**: `frontend/lab.js`

Add 150ms debounce to the search input's `input` event. Dropdown filters remain immediate.

**Acceptance**: Typing "Patrick Mahomes" fires 1-2 API calls, not 15.

---

### Task 5: Cache column definitions in render loop

**File**: `frontend/lab.js`

Resolve column definitions once per render cycle into a Map, pass into `buildRowHTML()`. Stop calling `getColumnDef()` per cell.

**Acceptance**: `getColumnDef()` called once per column per render, not once per cell.

---

### Task 6: Add defer to render-blocking scripts

**File**: `frontend/lab.html`

Add `defer` attribute to `lab.js` and `lab-panels.js` script tags (line ~3784-3789). Both are at the bottom of `<body>` already but `defer` enables parallel download and avoids blocking the HTML parser.

**Acceptance**: `lab.js` and `lab-panels.js` have `defer`. Page still functions correctly (verify screener loads, sidebar works, panels switch).

---


## Phase: Critical Security & Data Persistence

**Exit Criterion**: users.db survives deploys. Trial abuse is rate-limited. LLM endpoint is sandboxed. No stored XSS vectors. Request body sizes are capped.

### Task 1: Add Render persistent disk for users.db

**File**: render.yaml, backend/auth.py

Add a persistent disk mount to render.yaml. Update auth.py to use /data/users.db when on Render, fallback to data/users.db locally.

**Acceptance**: render.yaml has persistent disk config. users.db survives deploys. Tests pass.

---

### Task 2: Rate-limit registration to prevent trial abuse

**File**: backend/server.py

Max 3 registrations per IP per 24 hours using existing rate limit pattern.

**Acceptance**: 4th registration from same IP returns 429. Tests pass.

---

### Task 3: Sandbox Elite LLM endpoint

**File**: backend/server.py

Reject client role:system messages. Prepend mandatory fantasy football system prompt server-side. Cap max_tokens at 2000.

**Acceptance**: Client cannot override system prompt. max_tokens capped. Tests pass.

---

### Task 4: Add request body size limit middleware

**File**: backend/server.py

Reject Content-Length over 1MB with 413 status.

**Acceptance**: Requests over 1MB rejected. Tests pass.

---

### Task 5: Fix stored XSS in formula store

**Files**: backend/live_data/storage.py, frontend/formula-store.js

Server: reject HTML tags in name/description/creator_name. Frontend: escapeHtml on all formula store rendering.

**Acceptance**: HTML in formula fields rejected server-side. Frontend escapes all fields. Tests pass.

---

### Task 6: Cap formula import count

**File**: backend/auth.py, backend/server.py

Cap import list at 50 formulas. Validate weights string under 10KB each.

**Acceptance**: Import rejects lists over 50. Tests pass.

---

## Phase: Product Polish - CEO Opportunities

**Exit Criterion**: Pricing has Free tier card. Bureau has pre-connection preview. Nav says Bureau. First-visit Lab nudge exists.

### Task 1: Add Free tier card to pricing page

**File**: frontend/pricing.html

Three-column layout: Free / Pro / Elite. Free card lists all free features with Free Forever badge. CTA: Open The Lab.

**Acceptance**: Three pricing cards visible. Free card celebrates the free tier.

---

### Task 2: Add Bureau pre-connection visual preview

**File**: frontend/league-intel.html

Above connect card, add anonymized sample data: mini pressure map, blurred manager profile, mini trade finder result.

**Acceptance**: Visual preview above connect card. Uses anonymized data.

---

### Task 3: Shorten Bureau of Intelligence to Bureau in nav

**Files**: All HTML files with topnav

Replace nav link text. Keep full name on Bureau page h1.

**Acceptance**: All nav links say Bureau. Bureau page h1 unchanged.

---

### Task 4: Add first-visit Lab nudge

**File**: frontend/lab.js

localStorage-gated tooltip on first visit: suggest sorting by Target Share. Caveat font, slight rotation. Dismiss sets flag.

**Acceptance**: First-visit tooltip appears once. Clicking suggestion applies sort.

---

### Task 5: Fix pricing page HTML defaults to match yearly

**File**: frontend/pricing.html

Change HTML default prices from monthly to yearly to prevent flash of wrong pricing.

**Acceptance**: No flash of monthly pricing. HTML matches JS default.

---

## Phase: Whimsy and Easter Eggs

**Exit Criterion**: Console has ASCII tiger. Konami code works. 404 tiger walks. Footer taglines rotate. Loading dots animate.

### Task 1: Console.log ASCII tiger welcome art

**File**: frontend/app.js

ASCII tiger art + welcome message + global razzle object with .help(), .stats(), .tiger().

**Acceptance**: Console shows tiger art. razzle.help() works.

---

### Task 2: Konami Code confetti burst

**File**: frontend/app.js

Up Up Down Down Left Right Left Right B A triggers confetti, nav tiger spin, toast. Returns to normal after 5s.

**Acceptance**: Konami code triggers confetti. Returns to normal.

---

### Task 3: 404 tiger walks offscreen

**File**: frontend/404.html

After 3 seconds, tiger walks offscreen right. Caveat annotation fades in. Tiger re-enters from left.

**Acceptance**: Tiger walks, annotation appears, loops.

---

### Task 4: Randomized footer taglines

**File**: frontend/app.js

Replace footer text with random pick from 8 options on each page load.

**Acceptance**: Different tagline on each load.

---

### Task 5: Animated loading dots

**File**: frontend/styles.css

Add .loading-dots CSS class with staggered pulse. Apply to all loading states.

**Acceptance**: All loading states have animated dots.

---

### Task 6: Promo code easter eggs

**File**: frontend/pricing.html

RAZZLEDAZZLE, TIGER, GOAT get fun responses. Real codes still work.

**Acceptance**: Easter egg codes show personality.

---

## Phase: Visual Polish

**Exit Criterion**: Zero 1px borders on primary elements. Zero hardcoded white. Typography on-scale. prefers-reduced-motion exists.

### Task 1: Fix 1px borders across pricing, landing, agents

**Files**: frontend/index.html, frontend/pricing.html, frontend/agents.html

Replace 1px solid with 2px dashed on featured rows, feature lists, matrix cells, comparison table.

**Acceptance**: Zero 1px solid borders on primary content.

---

### Task 2: Fix hardcoded white and cold backgrounds for dark mode

**Files**: frontend/index.html, frontend/lab.html, frontend/app.js

sprawl-bubble white to var(--bg-card). Modal overlays to warm espresso rgba. Sleeper input to var(--bg-card).

**Acceptance**: No hardcoded white or cold rgba. Dark mode correct.

---

### Task 3: Fix off-scale typography

**Files**: frontend/index.html, frontend/lab.html

Hero h1 42px to 36px. Panel title 22px to 20px.

**Acceptance**: All font sizes on scale.

---

### Task 4: Add prefers-reduced-motion media query

**File**: frontend/styles.css

Global rule killing all animations when OS reduce-motion is enabled.

**Acceptance**: All animations stop with reduce-motion enabled.

---

## Phase: Brand Voice Copy Polish

**Exit Criterion**: No fake stats, no fear marketing, no generic SaaS copy.

### Task 1: Fix landing page copy

**File**: frontend/index.html

Replace fake 80 percent stat with Your edge is scattered across 12 tabs. Remove fear marketing. Fix self-congratulatory lines.

**Acceptance**: No fake statistics. No fear language.

---

### Task 2: Fix pricing page copy

**File**: frontend/pricing.html

Pick Your Plan to Pick Your Playbook. Trial banner to On the house. Feature Comparison to The full breakdown. FAQ header to Questions we keep getting.

**Acceptance**: All copy matches Razzle voice.

---

### Task 3: Fix agents page loading states

**File**: frontend/agents.html

Replace loading with pulling. Fix setup wizard copy. Fix pixel engine text.

**Acceptance**: Zero instances of loading in user-facing text.

---

## Phase: Staff Engineer Bug Fixes

**Exit Criterion**: Lifetime badge correct. Trial expiry enforced. Failed leagues retryable. Checkout has error state. Timeouts on all async calls.

### Task 1: Fix pro_lifetime badge

**File**: frontend/app.js

Fix updateAuthUI plan check to include pro_lifetime and elite_lifetime.

**Acceptance**: Lifetime users see correct badge.

---

### Task 2: Force re-check auth on tab focus

**File**: frontend/app.js

visibilitychange listener calls checkAuth() after 5+ minutes hidden.

**Acceptance**: Expired trial users lose Pro on tab return.

---

### Task 3: Fix dataset.loaded race condition

**File**: frontend/league-intel.html

Move dataset.loaded=true to after successful fetch. Set false on failure.

**Acceptance**: Failed league expansions retryable.

---

### Task 4: Add timeout to callServerLLM

**File**: frontend/warroom.js

30s AbortController. User-friendly error on timeout.

**Acceptance**: 30s timeout. Error message shown.

---

### Task 5: Add error state for failed checkout polling

**File**: frontend/app.js

After 10 failed polls, show clear error with next steps.

**Acceptance**: User sees actionable error.

---

### Task 6: Add getSleeperPlayers timeout and error handling

**File**: frontend/league-intel.html

15s AbortController. Try-catch. User-friendly error. Retry possible.

**Acceptance**: 15s timeout. Error shown. Retry works.

---
