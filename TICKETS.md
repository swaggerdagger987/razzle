# Razzle Loop — Ticket Queue

> Drop phase specs here. The loop checks this file before auto-generating its next phase.
> When a ticket is consumed, it gets deleted from this file.
> Format: each ticket is a full phase spec (same format as LOOP-TASKS.md).
> Multiple tickets = multiple phases, executed in order (first one becomes next phase).

---

## IMPORTANT: DO NOT re-upload terminal.db

The database file `data/terminal.db` uses WAL journal mode locally. Uploading it directly to GitHub releases produces a corrupt file because the WAL journal data is not included. **Never run `gh release upload` with `data/terminal.db`**. The clean version (`data/terminal_clean.db`, created with `VACUUM INTO`) is the only file that should be uploaded. A human handles DB uploads manually.

---

## Phase: Build Pipeline — esbuild Minification

**Exit Criterion**: All JS and CSS files are minified on deploy. Raw source files unchanged. Lab page JS payload drops from 1.16MB to ~350-400KB. Zero functionality changes.

### Task 1: Add esbuild minification to the Render build

**Files**: `render.yaml`, `backend/server.py`

1. In `render.yaml`, update the `buildCommand` to add esbuild minification after pip install:
```yaml
buildCommand: pip install -r requirements.txt && npx esbuild frontend/*.js --minify --outdir=frontend/dist/ && npx esbuild frontend/*.css --minify --outdir=frontend/dist/
```
2. Copy all non-JS/CSS frontend files (HTML, assets/, favicon.svg, etc.) into `frontend/dist/` as part of the build. Add to the buildCommand:
```
&& cp frontend/*.html frontend/dist/ && cp -r frontend/assets frontend/dist/assets && cp frontend/favicon.svg frontend/dist/
```
3. In `backend/server.py`, find the static file mount (line ~2784): `StaticFiles(directory=str(FRONTEND_DIR), html=True)`. Change `FRONTEND_DIR` to point to `frontend/dist/` in production. Keep a fallback to `frontend/` for local dev (when `dist/` doesn't exist):
```python
DIST_DIR = Path(__file__).resolve().parent.parent / "frontend" / "dist"
FRONTEND_DIR = DIST_DIR if DIST_DIR.exists() else Path(__file__).resolve().parent.parent / "frontend"
```
4. Add `frontend/dist/` to `.gitignore` — it's a build artifact, never committed.

**Why**: 1.16MB of unminified JS on the Lab page. esbuild runs in ~50ms, zero config, cuts payload 60-70%. Dev workflow unchanged — you still edit raw files in `frontend/`.

**Acceptance**: `render.yaml` build command includes esbuild. `frontend/dist/` is generated on build with minified JS/CSS + copied HTML/assets. Server serves from `dist/` in production, raw `frontend/` in local dev. `.gitignore` includes `frontend/dist/`. All pages load and function correctly from minified files. No source files modified by esbuild.

---

### Task 2: Verify minified build works end-to-end

**Files**: `frontend/dist/` (generated)

After the build pipeline is set up:
1. Run the build command locally to generate `frontend/dist/`
2. Start the server and verify it serves from `dist/`
3. Test: Lab screener loads, sidebar panel switching works, formulas work, charts render, warroom canvas animates, pricing page toggle works, auth modal opens
4. Check that all asset paths resolve (images, fonts, favicon)
5. Check that HTML files correctly reference the minified JS/CSS (since HTML files are copied as-is, script `src="lab.js"` will resolve to the minified `dist/lab.js`)

**Acceptance**: Full smoke test passes against minified build. No console errors. All features work identically to raw source.

---

## Phase: BYOK Security Transparency & Cleanup

**Exit Criterion**: Users understand the BYOK security model. Decrypt endpoint removed. No false sense of security from "cloud sync" encryption theater.

### Task 1: Remove the decrypt endpoint and cloud sync "load" feature

**Files**: `backend/server.py`, `frontend/warroom.js`

1. In `server.py`, remove or disable the `GET /api/user/api-keys/{provider}/decrypt` endpoint (line ~906-921). Keep the `POST /api/user/api-keys` save endpoint — encrypted backup is still useful, just don't send decrypted keys back to the browser.
2. In `warroom.js`, remove the "Load from cloud" button/logic that calls the decrypt endpoint. Keep the "Save to cloud" option — users can back up their key, they just re-paste it manually on a new browser instead of auto-loading it.

**Why**: The decrypt endpoint defeats the encryption by returning plaintext keys to the browser. Removing it closes the security theater while keeping encrypted backup as a genuine safety net (if localStorage is cleared, support can help restore from the encrypted copy).

**Acceptance**: No endpoint returns decrypted API keys to the browser. "Save to cloud" still works. "Load from cloud" button removed. Users must paste their key on each new browser.

---

### Task 2: Add BYOK security disclosure to the Situation Room

**File**: `frontend/agents.html`

In the API key configuration panel (where users paste their key), add a clear disclosure note below the input field:

Use Caveat font (handwritten annotation style, per design guide). Something like:

"your API key is stored in your browser's local storage. browser extensions on this page can technically see it. if that worries you, use a dedicated key with a spending limit on openrouter.ai — that way even if it leaks, the damage is capped."

Keep the tone Razzle — honest, helpful, not scary. This is not a legal disclaimer, it's a friend giving you a heads up.

**Why**: Users deserve to know where their key lives. Recommending a spending-capped key is the practical mitigation.

**Acceptance**: Disclosure text visible below the API key input in the config panel. Uses Caveat font. Mentions localStorage, extensions, and spending limit recommendation. Not a wall of legal text — 2-3 sentences max.

---

### Task 3: Add BYOK info to the pricing page FAQ

**File**: `frontend/pricing.html`

Add a new FAQ item:

**Q: "Is my API key safe?"**
**A: "Your key is stored in your browser only — we never see it. Browser extensions on the page could technically read it, so we recommend creating a dedicated key with a monthly spending cap on OpenRouter. That way you're covered even in the worst case."**

**Acceptance**: New FAQ entry present on pricing page. Honest, clear, not alarming.

---

## Phase: Review Fix 1 — Ship-Blockers (Infrastructure, Security, Critical Bugs)

**Exit Criterion**: App can physically start on Render without OOM. No user secrets exposed to the browser. No native JS methods shadowed. All 59 tests pass.

### Task 1: Fix Render deployment config — add plan, reduce SQLite memory

**Files**: `render.yaml`, `backend/db.py`

1. In `render.yaml`, add `plan: standard` under the web service definition (after `numInstances: 1`).
2. In `render.yaml`, change `startCommand` to: `uvicorn backend.server:app --host 0.0.0.0 --port $PORT --workers 2`
3. In `backend/db.py`, change `PRAGMA cache_size=-64000` to `PRAGMA cache_size=-8000` (8MB per connection instead of 64MB).
4. In `backend/db.py`, change `POOL_SIZE = 20` to `POOL_SIZE = 5`.
5. In `backend/db.py`, change `PRAGMA mmap_size=268435456` to `PRAGMA mmap_size=67108864` (64MB instead of 256MB).

**Why**: 64MB cache x 20 connections = 1.28GB memory ceiling. Render free tier = 512MB. App will OOM before serving a single request. New config: 8MB x 5 = 40MB ceiling, well within standard plan (2GB).

**Acceptance**: `render.yaml` has `plan: standard` and `--workers 2`. `db.py` has `cache_size=-8000`, `POOL_SIZE = 5`, `mmap_size=67108864`. Tests pass.

---

### Task 2: Make JWT_SECRET and ENCRYPTION_KEY required — refuse to start without them

**File**: `backend/auth.py`

1. Find the `JWT_SECRET` fallback (line ~27-29) that generates random bytes when the env var is missing. Remove the fallback. If `JWT_SECRET` is not set, raise `RuntimeError("JWT_SECRET environment variable is required")` at module load.
2. Find the `_ENCRYPTION_KEY_RAW` fallback (line ~861-864) that falls back to `JWT_SECRET`. Remove the fallback. If `ENCRYPTION_KEY` is not set, raise `RuntimeError("ENCRYPTION_KEY environment variable is required")` at module load.

**Why**: Random JWT secret on restart logs out all users. Encryption key derived from random JWT secret makes stored BYOK keys permanently unrecoverable after restart.

**Acceptance**: Server refuses to start without `JWT_SECRET` and `ENCRYPTION_KEY` set. No random fallbacks remain. For tests, set these as env vars in the test setup or use a test fixture. Tests pass.

---

### Task 3: Rename `setInterval` function on pricing page

**File**: `frontend/pricing.html`

Find `function setInterval(interval)` (line ~444) and rename it to `setPricingInterval`. Update all calls to this function in the same file.

**Why**: Shadows native `window.setInterval`, breaking all timer-based functionality on the pricing page.

**Acceptance**: No function named `setInterval` exists in pricing.html. All references updated to `setPricingInterval`. Pricing toggle still works.

---

### Task 4: Fix CSP to whitelist html2canvas and jsdelivr

**File**: `backend/server.py`

Find the `Content-Security-Policy` header's `script-src` directive (line ~373). Add `https://html2canvas.hertzen.com https://cdn.jsdelivr.net` to the whitelist.

Change:
```
script-src 'self' 'unsafe-inline' https://js.stripe.com https://pagead2.googlesyndication.com
```

To:
```
script-src 'self' 'unsafe-inline' https://js.stripe.com https://pagead2.googlesyndication.com https://html2canvas.hertzen.com https://cdn.jsdelivr.net
```

**Why**: 61 pages load html2canvas from these domains. CSP blocks them in production, breaking the screenshot/export feature entirely. Invisible in local dev.

**Acceptance**: CSP script-src includes both domains. Tests pass.

---

### Task 5: Fix CORS — restrict allow_headers and allow_methods

**File**: `backend/server.py`

Find the CORS middleware (line ~287-292). Change `allow_headers=["*"]` to `allow_headers=["Authorization", "Content-Type"]`. Change `allow_methods=["*"]` to `allow_methods=["GET", "POST", "DELETE", "OPTIONS"]`.

**Why**: `allow_headers=["*"]` is more permissive than needed and widens the attack surface.

**Acceptance**: CORS uses explicit header and method lists. Tests pass.

---

### Task 6: Add rate limiting to screener POST endpoint

**File**: `backend/server.py`

Find the `POST /api/screener/query` endpoint (line ~1198). Add rate limiting using the existing `_check_rate_limit` function — 30 requests per 60 seconds per IP.

**Why**: Unrate-limited POST against a 924MB database is a DoS vector. Complex queries can take 200ms+ each.

**Acceptance**: Screener endpoint returns 429 after 30 requests in 60 seconds from same IP. Tests pass.

---

### Task 7: Add authentication to formula rating endpoint

**File**: `backend/server.py`

Find `POST /api/formulas/{formula_id}/rate` (line ~1543-1550). Add authentication (require valid JWT token via `get_current_user`). Add deduplication — one rating per user per formula (store `user_id` with rating, check before inserting).

**Why**: Currently accepts ratings from any request with no auth, no rate limiting, no deduplication. Anyone can manipulate formula ratings.

**Acceptance**: Endpoint requires auth. One rating per user per formula enforced. Unauthenticated requests return 401. Tests pass.

---

### Task 8: Sanitize error messages — health endpoint, Stripe errors, LIKE wildcards

**Files**: `backend/server.py`, `backend/billing.py`, `backend/auth.py`, `backend/live_data/players.py`

1. In `server.py`, find the health endpoint (line ~456-511). For unauthenticated responses, return only `{"status": "ok"}` or `{"status": "degraded"}`. Remove `str(e)` error details, user count, cache stats, and pool stats from the public response. Log details server-side only.
2. In `billing.py`, find the Stripe error handler (line ~321-322). Replace `return {"error": str(e), "status": 400}` with `return {"error": "Payment processing error. Please try again.", "status": 400}`. Log `str(e)` server-side.
3. In `auth.py`, find the LIKE search (line ~442-443) where `f"%{search}%"` is used. Escape LIKE wildcards: `search = search.replace('%', '\\%').replace('_', '\\_')` before inserting into the pattern. Add `ESCAPE '\\'` to the SQL LIKE clause.
4. In `players.py`, find the LIKE search (line ~131) and apply the same wildcard escaping.

**Why**: Health endpoint leaks internal architecture. Stripe errors may contain customer/price IDs. LIKE wildcards allow broader data matching than intended.

**Acceptance**: Health endpoint returns no internal details. Stripe errors are generic. LIKE searches escape `%` and `_`. Tests pass.

---

### Task 9: Validate Sleeper username — prevent SSRF

**File**: `backend/server.py`

Find the Sleeper username validation (line ~608-621) where `sleeper_username` is injected into a URL. Before constructing the URL, validate the username with a strict regex: `^[a-zA-Z0-9_]{1,30}$`. If the username doesn't match, return a 400 error immediately.

**Why**: Special characters, null bytes, or path traversal in the username could manipulate the HTTP request to the Sleeper API.

**Acceptance**: Sleeper username is validated against `^[a-zA-Z0-9_]{1,30}$`. Invalid usernames return 400 without making any HTTP request. Tests pass.

---

### Task 10: Clean up repo — delete junk files, fix .gitignore

**Files**: Root directory, `.gitignore`

1. Delete `=7.0.0` from repo root (pip install stdout accidentally saved as file).
2. Delete `_chk_0.js` from repo root (orphaned test/check file, never referenced).
3. Delete `users.db` from repo root (0-byte duplicate, real one is at `data/users.db`).
4. Add to `.gitignore`: `users.db`, `.pytest_cache/`, `=*`
5. Remove `pytest>=7.0.0` from `requirements.txt` (test-only dependency shouldn't be in production).

**Why**: Junk files are deployed to production. pytest is installed on Render unnecessarily.

**Acceptance**: Three files deleted. `.gitignore` updated. pytest not in `requirements.txt`. Tests pass (create `requirements-dev.txt` with pytest if needed for test runs).

---

## Phase: Mobile Hamburger Menu

**Exit Criterion**: All pages have a functional hamburger menu on screens below 768px. All nav links are accessible. Desktop nav unchanged.

### Task 1: Add hamburger menu component

**Files**: `frontend/styles.css`, `frontend/app.js`

1. In `app.js`, find where the topnav is initialized or where `updateAuthUI` builds the nav. Add a hamburger toggle button that only appears below 768px:
```html
<button class="hamburger-toggle" aria-label="Open navigation menu" aria-expanded="false">🐾</button>
```
2. On click, toggle a `.mobile-nav-open` class on the `<nav>` element. Update `aria-expanded` accordingly.
3. Add a slide-out panel (from the left) containing:
   - All 5 nav links: Home, The Lab, Bureau of Intelligence, Situation Room, Pricing
   - Theme toggle (sun/moon)
   - Sign In button (or user account info if logged in)
4. Clicking a link or tapping outside the panel closes it. Escape key closes it.
5. Add the hamburger button dynamically via JS (same pattern as the theme toggle injection) so all 74 pages get it automatically.

**CSS in `styles.css`**:
```css
.hamburger-toggle {
    display: none; /* hidden on desktop */
    background: var(--bg-card);
    border: 2px solid var(--ink);
    border-radius: 8px;
    font-size: 20px;
    padding: 4px 8px;
    cursor: pointer;
    box-shadow: 2px 2px 0 var(--ink);
}

@media (max-width: 768px) {
    .hamburger-toggle { display: block; }
    .nav-links { display: none; } /* hide horizontal nav on mobile */
    .nav-links.mobile-nav-open {
        display: flex;
        flex-direction: column;
        position: fixed;
        top: 0;
        left: 0;
        width: 280px;
        height: 100vh;
        background: var(--bg-card);
        border-right: 3px solid var(--ink);
        box-shadow: 6px 0 0 var(--ink);
        padding: 24px 16px;
        gap: 8px;
        z-index: 1000;
    }
}
```

Style the panel with Razzle aesthetic: chunky 3px border, offset shadow, sand/card background, ink text. Nav links should be full-width, 44px+ touch targets, `var(--font-display)` font.

**Why**: No mobile navigation exists. 9px horizontal scroll with hidden scrollbars means mobile users can't find Situation Room or Pricing.

**Acceptance**: Tiger paw button visible on mobile only. Tapping it opens a left-sliding panel with all 5 nav links + theme toggle + sign in. Panel has chunky Razzle styling. Escape and outside-tap close it. Desktop nav completely unchanged. Works on all 74 pages.

---

### Task 2: Fix mobile nav text size and touch targets

**File**: `frontend/styles.css`

1. Remove the 375px breakpoint that shrinks nav to 9px (line ~967-970). The hamburger menu replaces this.
2. Remove `scrollbar-width: none` and `::-webkit-scrollbar { display: none }` from `.nav-links` (line ~661-667) — no longer needed since mobile uses the hamburger instead of horizontal scroll.
3. Ensure all links in the mobile panel have minimum 44px height touch targets.
4. In the mobile panel, style the active page link with `background: var(--bg-warm)` and `border-left: 3px solid var(--orange)` to show where you are.

**Acceptance**: No text below 12px anywhere in the nav on any screen size. All touch targets >= 44px. Active page highlighted in mobile menu. No horizontal scroll remnants.

---

## Phase: Review Fix 2 — Accessibility (WCAG AA Compliance)

**Exit Criterion**: All 74 pages allow pinch-to-zoom. All interactive elements are keyboard-accessible. Modals trap focus. Color contrast meets 4.5:1 for text. Skip-nav links on all pages.

### Task 1: Remove maximum-scale=1.0 from all 74 pages

**Files**: All HTML files in `frontend/`

Find and replace across all HTML files:
- Replace `maximum-scale=1.0` with nothing (remove it from the viewport meta tag)
- Result: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`

**Why**: Blocks pinch-to-zoom for visually impaired users. WCAG 1.4.4 Level AA violation.

**Acceptance**: Zero instances of `maximum-scale` in any HTML file. All pages still render correctly.

---

### Task 2: Add skip-nav links and aria-labels to all pages

**Files**: All HTML files in `frontend/`

1. In every HTML file, immediately after the opening `<body>` tag, add: `<a href="#main-content" class="sr-only" style="position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;" onfocus="this.style.position='static';this.style.width='auto';this.style.height='auto';" onblur="this.style.position='absolute';this.style.left='-9999px';this.style.width='1px';this.style.height='1px';">Skip to main content</a>`
2. Add `aria-label="Main navigation"` to every `<nav class="topnav">` element.
3. Wrap the main content area in `<main id="main-content">` on pages that don't already have it (index.html, lab.html, league-intel.html, pricing.html, about.html, 404.html, agents.html).

**Why**: WCAG 2.4.1 Level A — keyboard users must be able to bypass navigation. Only agents.html currently has a skip link.

**Acceptance**: Every page has a skip-nav link, nav aria-label, and main landmark. Keyboard users can tab to "Skip to main content" and jump past navigation.

---

### Task 3: Fix focus indicators — replace outline:none with focus-visible styles

**File**: `frontend/styles.css`

1. Find `.auth-form input { outline: none; }` (line ~443). Add: `.auth-form input:focus-visible { outline: 3px solid var(--orange); outline-offset: 2px; }`
2. Find `.input-chunky { outline: none; }` (line ~619). Add: `.input-chunky:focus-visible { outline: 3px solid var(--orange); outline-offset: 2px; }`
3. Find `.select-chunky { outline: none; }` (line ~643). This one has NO replacement focus style at all. Add: `.select-chunky:focus-visible { outline: 3px solid var(--orange); outline-offset: 2px; }`
4. Find `cmd-palette-input` outline:none (line ~789). Add focus-visible style matching the above pattern.

**Why**: WCAG 2.4.7 Level AA — keyboard users cannot see which element has focus. The existing `btn-chunky:focus-visible` pattern (line ~511-517) is the model.

**Acceptance**: Every element with `outline: none` has a `:focus-visible` replacement with 3px orange outline. Zero elements have invisible focus state.

---

### Task 4: Fix color contrast — darken --ink-light and fix --ink-faint usage

**File**: `frontend/styles.css`

1. Change `--ink-light: #8a7565` to `--ink-light: #6d5c4e` (achieves ~4.5:1 contrast on #ede0cf sand background).
2. Audit all uses of `var(--ink-faint)` on interactive elements (input borders, clickable text). Where `--ink-faint` is used for interactive element borders, change to `var(--ink-light)` instead.
3. In dark mode (`[data-theme="dark"]`), update `--ink-light` correspondingly to maintain contrast on the dark background.

**Why**: `--ink-light` (#8a7565) on sand (#ede0cf) = 2.9:1 contrast (needs 4.5:1 for WCAG AA). `--ink-faint` (#c4b5a5) on sand = 1.4:1, used for input borders making them nearly invisible.

**Acceptance**: `--ink-light` contrast ratio on sand is >= 4.5:1. No interactive element borders use `--ink-faint`. Dark mode values updated correspondingly.

---

### Task 5: Add role="dialog" and focus trapping to modals

**Files**: `frontend/app.js`, `frontend/lab.html`, `frontend/styles.css`

1. In `app.js`, find the auth modal creation (~line 313-317). Add `role="dialog"`, `aria-modal="true"`, `aria-labelledby="auth-modal-title"` to the overlay div. Add `aria-label="Close sign-in dialog"` to the close button. Add Escape key handler to close the modal. Add focus trapping (tab should cycle within the modal, not escape to background).
2. In `lab.html`, find the filter modal (~line 3267), column picker (~line 3289), chart panel (~line 3322), compare panel (~line 3350), and share modal (~line 3364). Add `role="dialog"` and `aria-modal="true"` to each. Add Escape key handler to close.
3. When any modal opens, move focus to the first interactive element inside it. When it closes, return focus to the trigger element.

**Why**: WCAG 2.4.3 Level A — modals have no ARIA roles, no focus trapping, no keyboard close. Screen readers don't announce modal context. Users can tab behind modals.

**Acceptance**: All modals have `role="dialog"` and `aria-modal="true"`. Escape closes modals. Focus is trapped inside open modals. Focus returns to trigger on close.

---

### Task 6: Fix screener table accessibility

**Files**: `frontend/lab.html`, `frontend/lab.js`

1. In `lab.html`, find the screener table (~line 3207). Add `<caption class="sr-only">NFL Player Statistics Screener</caption>` inside the table element.
2. In `lab.js`, find where `<th>` elements are generated dynamically for the screener table header. Add `scope="col"` to every generated `<th>`.

**Why**: WCAG 1.3.1 Level A — screen readers cannot understand column-to-cell relationships in the primary data interface. 60+ columns of numeric data with no header association.

**Acceptance**: Screener table has a `<caption>`. All dynamically generated `<th>` elements have `scope="col"`.

---

### Task 7: Convert nav search span to button, fix non-semantic interactive elements

**Files**: All HTML files in `frontend/`, `frontend/agents.html`

1. In every HTML file, find `<span class="nav-search-hint" onclick="...">`. Change to `<button class="nav-search-hint" onclick="..." aria-label="Open quick search (Ctrl+K)">`. Update CSS if needed (remove any `cursor: pointer` since buttons have it by default).
2. In `agents.html`, find the `.ask-ref-item` divs with onclick (~line 1684-1726). Change to `<button class="ask-ref-item">` elements. They will inherit the onclick behavior.
3. In `agents.html`, find the briefing card headers with `cursor: pointer` (~line 810). Add `role="button"`, `tabindex="0"`, and `aria-expanded="true/false"` attribute that updates on toggle. Add keydown handler for Enter/Space.

**Why**: WCAG 2.1.1 Level A — non-focusable elements with onclick are invisible to keyboard users. The nav search hint is the primary search entry point.

**Acceptance**: Zero `<span>` or `<div>` elements with onclick remain for interactive controls. All interactive elements are keyboard-accessible.

---

### Task 8: Add aria-labels to canvas elements and images

**Files**: `frontend/lab.js`, `frontend/lab-panels.js`, `frontend/index.html`, `frontend/league-intel.html`

1. In `lab.js`, wherever a `<canvas>` element is created dynamically for charts (scatter, radar, trend, heat map), add `role="img"` and a descriptive `aria-label` (e.g., `aria-label="Scatter plot: [stat1] vs [stat2]"`).
2. In `lab-panels.js`, same treatment for all panel canvases (sparklines, bar charts, histograms, pie charts, aging curves).
3. In `index.html`, find the miniWarRoom canvas (~line 1246). Add `role="img"` and `aria-label="Animated pixel art war room with fantasy football agents"`.
4. In `index.html`, find the three SVG knot illustrations (~line 1012-1054). Add `aria-hidden="true"` since they are decorative.
5. In `league-intel.html`, add `role="img"` and `aria-label` to any canvas elements (activity timeline, etc.).

**Why**: WCAG 1.1.1 Level A — 30+ canvas elements have no text alternative. All visualization data is invisible to screen readers.

**Acceptance**: Every canvas element has `role="img"` and a descriptive `aria-label`. Decorative SVGs have `aria-hidden="true"`.

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
