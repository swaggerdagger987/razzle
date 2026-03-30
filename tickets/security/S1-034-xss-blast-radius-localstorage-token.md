---
severity: S1
confidence: HIGH
category: security
source: go-live-audit-2026-03-29
audit_ref: "Finding 3: XSS blast radius — auth token in localStorage + CSP allows unsafe-inline"
---

# XSS blast radius: auth token in localStorage + CSP allows unsafe-inline scripts

## What's Wrong

Three things combine into a serious security gap:

1. **JWT stored in localStorage** — `frontend/app.js:1134` (`localStorage.setItem("razzle_token", data.token)`) and `app.js:1179` (same on register). Any XSS can read this.
2. **CSP allows `'unsafe-inline'`** — `backend/server.py:732` includes `script-src 'self' 'unsafe-inline' ...`. This means injected inline scripts execute freely.
3. **Unsanitized HTML interpolation** — `frontend/charts.js:1267-1268` interpolates `p.prospect.player_name` and `p.prospect.position` directly into HTML template literals without escaping.

Combined: if any player name in the database contains `<script>` or event handlers, it executes in the user's browser and can steal their JWT token.

## Root Cause

**File**: `frontend/app.js:1134` — `localStorage.setItem("razzle_token", data.token)`
**File**: `frontend/app.js:1179` — same pattern on register
**File**: `backend/server.py:732` — `script-src 'self' 'unsafe-inline'`
**File**: `frontend/charts.js:1267-1268` — unsanitized `player_name` and `position` in template literal HTML

## The Fix

Three-part fix, in priority order:

### Part 1: Sanitize the HTML sink in charts.js (immediate)

**File**: `frontend/charts.js:1267-1268`

The `escapeHtml` function should already exist in `app.js`. Use it:
```javascript
html += `<th ...><span ...>${escapeHtml(p.prospect.player_name)}</span>
  <span ...>${escapeHtml(p.prospect.position)}</span></th>`;
```

Grep the entire frontend for other template literal HTML sinks that interpolate data from API responses without escaping. Common pattern: `` `<tag>${variable}</tag>` `` where `variable` comes from fetch response.

### Part 2: Tighten CSP (important)

**File**: `backend/server.py:732`

Remove `'unsafe-inline'` from `script-src`. This requires moving any inline `<script>` blocks in HTML files to external `.js` files, or adding nonce-based CSP. If moving scripts is too much for launch, at minimum add `'strict-dynamic'` with nonces.

### Part 3: Consider httpOnly cookies for token (post-launch)

Moving the JWT to an httpOnly cookie makes it invisible to JavaScript entirely. This is a larger change — flag for post-launch but note it in PROGRESS.md.

## Acceptance Criteria

- [ ] `charts.js:1267-1268` uses `escapeHtml()` on player_name and position
- [ ] Grep `frontend/` for `\${.*\.(name|player_name|position|team|label)}` in template literals building HTML — all must be escaped
- [ ] If `'unsafe-inline'` can be removed from CSP without breaking the site, remove it
- [ ] `python functional-qa/tests/smoke.py` passes
- [ ] Prospect comparison table still renders correctly

## Context

Security finding from go-live audit. The combination of localStorage tokens + unsafe-inline CSP + unsanitized HTML sinks means a single XSS vector can compromise any logged-in user's account. Part 1 is the critical fix. Part 2 hardens the defense. Part 3 is post-launch.
