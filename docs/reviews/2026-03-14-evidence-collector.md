# Evidence Collector Audit — 2026-03-14

Focused read-only audit of provably broken references, dead code, orphaned files, and misconfiguration across the entire Razzle codebase.

---

## Summary

74 HTML files, 11 JS files, 2 CSS files, 18 Python files, 2 config files scanned. The codebase is structurally sound -- no broken script/CSS/HTML references. The major issues from the March 13 review (undefined CSS vars, setInterval shadow, maximum-scale zoom blocking, CSP missing html2canvas, bare sans-serif fonts, pool sizing, API key decrypt endpoint, missing hamburger menu) have all been fixed. Remaining findings are mostly hygiene issues: gitignore gaps, orphaned root files, BYOK API keys stored in plaintext localStorage, massive JS file sizes without code-splitting, and 4,271 inline styles across HTML files.

---

## CRITICAL Findings

### 1. BYOK API keys stored in plaintext localStorage
- **Severity**: CRITICAL
- **File**: `frontend/warroom.js:1345-1359`
- **Evidence**: `localStorage.setItem(AGENT_CONFIG_KEY, JSON.stringify(cfg))` where `cfg` contains `apiKey` field with raw OpenRouter API key
- **What breaks**: Any XSS vulnerability (or malicious browser extension) can exfiltrate user API keys. The server-side encrypt endpoint was correctly removed, but the client-side BYOK flow still writes the raw key to localStorage under `razzle_agent_config`.
- **Note**: The server-side decrypt endpoint was removed (line 1232 comment confirms). But the BYOK flow sends keys directly from browser to OpenRouter (`callLLM` at line 2275 uses `Authorization: Bearer + apiKey`). The key lives in localStorage indefinitely.

### 2. SQLite WAL/SHM files not gitignored
- **Severity**: CRITICAL
- **File**: `.gitignore`
- **Evidence**: `data/*.db` does not match `data/terminal.db-shm` or `data/terminal.db-wal`. `git status` confirms both are untracked and visible:
  ```
  ?? data/terminal.db-shm
  ?? data/terminal.db-wal
  ```
- **What breaks**: A careless `git add .` or `git add data/` would commit SQLite journal files (potentially hundreds of MB) to the repo. These are transient runtime artifacts.
- **Fix**: Add `data/*.db-shm` and `data/*.db-wal` to `.gitignore`.

---

## HIGH Findings

### 3. Orphaned files at repo root
- **Severity**: HIGH
- **Files**:
  - `BUGFIX-TRACKER.md` (4.7KB) -- process artifact
  - `BUGS.md` (3.4KB) -- process artifact
  - `EDGE-CASES.md` (18.3KB) -- process artifact, untracked
  - `PLATFORM-LOOP-TASKS.md` (3KB) -- obsolete loop task file
  - `UX-LOOP-TASKS.md` (6.6KB) -- obsolete loop task file
  - `QA-AUDIT.md` (1.9KB) -- process artifact
  - `REFINER-LOG.md` (7.1KB) -- process artifact
  - `bugfix-prompt.txt` (2.6KB) -- loop prompt, untracked
  - `razzle-status-update-mar14.md` (5.6KB) -- status report, untracked
  - `AGENTS.md` (1.9KB) -- duplicates info in agent-personas/
- **What breaks**: Nothing functionally, but violates project structure rules from CLAUDE.md ("No files outside the defined folders"). 10 files at root that belong in `docs/` or should be deleted. Clutters the repo and makes it harder to navigate.

### 4. data/terminal_clean.db is a 490MB orphan
- **Severity**: HIGH
- **File**: `data/terminal_clean.db` (490MB)
- **Evidence**: Zero references in any Python file. Only mentioned in `TICKETS.md` as a manual upload artifact. Gitignored by `data/*.db` glob but still physically present.
- **What breaks**: Wastes 490MB of local disk. Could cause confusion about which DB is authoritative. The real DB is `data/terminal.db` (1.1GB).

### 5. lab.js is 12,636 lines / 500KB — no code splitting
- **Severity**: HIGH
- **File**: `frontend/lab.js` (12,636 lines, 500KB)
- **Evidence**: 352 function definitions in a single file. `frontend/lab-panels.js` is another 10,091 lines / 480KB with 264 functions.
- **What breaks**: The render.yaml build step minifies but does not tree-shake or code-split. Lab page loads ~1MB of JS (lab.js + lab-panels.js + charts.js + app.js + formulas.js + formula-store.js + lab-mockdraft.js + lab-prospect-radar.js). Even minified, this is heavy for initial page load.

### 6. 4,271 inline styles across HTML files
- **Severity**: HIGH
- **Evidence**: `grep -c 'style="' frontend/*.html` totals 4,271. Top offenders:
  - lab.html: 244
  - agents.html: 187
  - pricing.html: 117
  - index.html: 117
  - league-intel.html: 106
- **What breaks**: Makes dark mode/theme changes impossible for styled elements. Maintenance nightmare -- every style change requires finding and editing inline attributes across 74 files.

### 7. Gradient in data bars violates design guide
- **Severity**: HIGH
- **File**: `frontend/lab.js:1792-1798`
- **Evidence**: `background:linear-gradient(90deg, ${barColor} ${bw}%, transparent ${bw}%)`
- **What breaks**: DESIGN.md rule: "NO gradients." This was flagged in the March 13 review and remains unfixed.

### 8. Cold gray `#3a3a3a` in warroom pixel canvas
- **Severity**: HIGH
- **File**: `frontend/warroom.js:69`
- **Evidence**: `chairSeat: '#3a3a3a'` -- Tailwind cold gray, not Razzle warm palette
- **What breaks**: Violates "always use espresso brown" color rule from DESIGN.md.

---

## MEDIUM Findings

### 9. 27 console.log/error statements in production JS
- **Severity**: MEDIUM
- **Evidence by file**:
  - `frontend/lab.js`: 13 statements (errors on fetch failures)
  - `frontend/app.js`: 5 statements (ASCII tiger art -- intentional easter egg)
  - `frontend/formula-store.js`: 5 statements
  - `frontend/charts.js`: 4 statements
- **What breaks**: Nothing functionally. The app.js console statements are an intentional brand touch (ASCII tiger + `razzle.help()`). The error logging in lab.js and charts.js is useful for debugging. But 22 error-logging console statements could leak internal details to users who open DevTools.

### 10. Toast uses textContent, cannot render HTML
- **Severity**: MEDIUM
- **File**: `frontend/app.js:354`
- **Evidence**: `toast.textContent = msg;`
- **What breaks**: Any toast message with actionable HTML (links, bold text) renders as literal text. For example, a toast saying "Upgrade to <a href='/pricing.html'>Pro</a>" would show the raw tags.

### 11. In-memory rate limiters reset on deploy/restart
- **Severity**: MEDIUM
- **Files**: `backend/server.py:58-118` (3 separate rate limiter dicts)
- **Evidence**: `_rate_buckets = defaultdict(list)`, `_sensitive_rate_buckets = defaultdict(list)`, `_screener_rate_buckets = defaultdict(list)` -- all in-memory Python dicts.
- **What breaks**: Every Render deploy (which happens on every push) resets all rate limits. An attacker could time their abuse around deploys. With `autoDeploy: true`, this could be exploited.

### 12. compare.js and player.js use innerHTML without escaping
- **Severity**: MEDIUM
- **Files**: `frontend/compare.js` (5 innerHTML calls, 0 escapeHtml), `frontend/player.js` (8 innerHTML calls, 0 escapeHtml)
- **Evidence**: Both files insert API response data into DOM via innerHTML without calling `escapeHtml()` (defined in app.js). Player names and team names from the API are trusted.
- **What breaks**: If a player name in the database contained HTML/script tags, it would execute. Low real-world risk since data comes from nflverse, but violates defense-in-depth.

### 13. 30 `!important` declarations in CSS
- **Severity**: MEDIUM
- **Files**: `frontend/styles.css` (23), `frontend/lab-panels.css` (7)
- **What breaks**: Specificity wars. Makes future styling changes harder and is a code smell indicating CSS architecture issues.

### 14. Render plan is "standard" -- verify memory adequacy
- **Severity**: MEDIUM
- **File**: `render.yaml:6`
- **Evidence**: `plan: standard` -- Render Standard plan provides 2GB RAM. With `POOL_SIZE=5` and 8MB cache per connection (40MB total for pool) plus mmap at 64MB, the memory footprint should be ~200MB for the app + connection overhead. The terminal.db is 1.1GB on disk but the mmap only maps 64MB.
- **What breaks**: Should work, but needs load testing to confirm. The March 13 review flagged this as a ship-blocker when pool was 20 connections x 64MB. Now at 5 x 8MB it's far more reasonable.

---

## LOW Findings

### 15. AdSense publisher ID is empty
- **Severity**: LOW
- **File**: `frontend/app.js:1270`
- **Evidence**: `var ADSENSE_PUB_ID = ""; // e.g., "ca-pub-XXXXXXXXXX"` followed by `if (!ADSENSE_PUB_ID) return;`
- **What breaks**: No ads will display. Zero ad revenue on launch day. The code is correctly guarded (returns early when empty), so it's not a bug, just incomplete configuration.

### 16. `__pycache__` directories present locally
- **Severity**: LOW
- **Evidence**: 3 `__pycache__` directories with `.pyc` files under `adapters/`, `backend/`, `backend/live_data/`
- **What breaks**: Nothing -- gitignored by `__pycache__/` in `.gitignore`. Just local clutter.

### 17. gradient in CSS loading skeleton
- **Severity**: LOW
- **File**: `frontend/styles.css:731`
- **Evidence**: `background: linear-gradient(90deg, var(--bg-warm) 25%, var(--bg-card) 50%, var(--bg-warm) 75%);`
- **What breaks**: Another gradient violation per DESIGN.md, but this is a shimmer animation for loading skeletons -- arguably acceptable as a non-decorative animation effect.

---

## Trend Comparison vs. March 13 Review

Issues FIXED since March 13 (confirmed in this audit):

| Finding | Status |
|---------|--------|
| `function setInterval()` shadowing native (pricing.html:444) | FIXED -- no longer present |
| `maximum-scale=1.0` blocking zoom (all 74 pages) | FIXED -- zero instances found |
| CSP missing html2canvas whitelist | FIXED -- added to CSP at server.py:556 |
| Undefined CSS vars `--accent`, `--bg-main`, `--border-light`, `--font-data` | FIXED -- zero instances found |
| Bare `sans-serif` in canvas (121 occurrences) | FIXED -- zero instances in all JS files |
| API key decrypt endpoint (returning plaintext) | FIXED -- removed (server.py:1232 comment) |
| No hamburger menu on mobile | FIXED -- implemented in app.js:48-93 |
| Connection pool OOM (20 x 64MB) | FIXED -- now 5 x 8MB (db.py:24,37) |
| CORS `allow_headers=["*"]` | FIXED -- now `["Authorization", "Content-Type"]` (server.py:399) |
| JWT_SECRET random fallback in production | FIXED -- now `raise RuntimeError` in production (auth.py:35-38) |
| Missing `role="dialog"` on modals | PARTIALLY FIXED -- present in app.js, lab.html has 19 instances |
| No rate limit on screener POST | FIXED -- `_check_screener_rate` at 30/60s (server.py:101-118, 1515) |
| Render plan unspecified | FIXED -- now `plan: standard` (render.yaml:6) |

Issues STILL PRESENT from March 13:

| Finding | Status |
|---------|--------|
| BYOK API keys in localStorage plaintext | Still present |
| Gradient in data bars (lab.js) | Still present |
| Cold gray hex values in warroom canvas | Still present (reduced to 1 instance) |
| Toast uses textContent (can't render HTML) | Still present |
| In-memory rate limiters reset on deploy | Still present (by design?) |
| lab.js / lab-panels.js massive file sizes | Still present |
| 4,271 inline styles | Still present |
| !important abuse in CSS | Still present |

---

## Methodology

- **Files scanned**: 74 HTML, 11 JS, 2 CSS, 18 Python, 2 config, 1 .gitignore = 108 files
- **Checks performed**: Broken references (JS/CSS/HTML/image paths), undefined functions, API endpoint mismatches, hardcoded URLs, console statements, TODO/FIXME markers, dead code, orphaned files, duplicate definitions, mismatched DOM IDs, gitignore gaps
- **Date**: 2026-03-14
- **Persona**: Evidence Collector (read-only)
- **Prior review compared**: 2026-03-13-review.md
