# QA + UX Audit — Phases 41-45

**Audit Date**: 2026-03-09
**Scope**: All files changed in Phases 41-45 (PBP stats, auth, Stripe, brand voice, Pro gating)
**Files Audited**: backend/{auth,billing,server,live_data}.py, adapters/nflverse_adapter.py, frontend/{warroom,lab,app,formula-store,charts}.js, frontend/{agents,index,league-intel,404}.html, frontend/styles.css

---

## QA FINDINGS

### CRITICAL

**QA-C1: Formula Store XSS — Unescaped Name/Creator in innerHTML**
- **File**: `frontend/formula-store.js:469-470`
- **Issue**: Formula name and creator are rendered via innerHTML without `escapeHtml()`. A malicious formula published via API could execute JavaScript.
- **Fix**: Wrap `formula.name` and `formula.creator` in `escapeHtml()`.

### HIGH

**QA-H1: Client-Side Pro Gating — Bypassable via localStorage**
- **File**: `frontend/warroom.js:1736-1741`
- **Issue**: `isProUser()` reads `plan` from localStorage, which users can edit. League context can be unlocked without paying.
- **Mitigating factor**: LLM calls use the user's own API key (not Razzle's), so the financial harm is limited to seeing league context in generic mode prompts.
- **Fix**: For now, acceptable. When Razzle hosts LLM calls for Pro users, add server-side plan verification.

**QA-H2: require_plan() Defined But Never Called on Any Endpoint**
- **File**: `backend/server.py:191-198`
- **Issue**: The `require_plan()` function exists but no endpoint uses it. No server-side plan enforcement.
- **Fix**: Apply `require_plan("pro")` to any future Pro-only API endpoints. Currently, all Pro features are client-side (War Room LLM calls), so this is acceptable for now.

**QA-H3: No Rate Limiting on Auth Endpoints**
- **File**: `backend/server.py:201-220`
- **Issue**: Login/register endpoints have no rate limiting. Brute force attacks possible.
- **Fix**: Add rate limiting (e.g., `slowapi` library or custom IP-based limiting).

**QA-H4: JWT Secret Resets on Server Restart Without Env Var**
- **File**: `backend/auth.py:22-25`
- **Issue**: Without `JWT_SECRET` env var, a random secret is generated per restart, invalidating all sessions.
- **Fix**: Require `JWT_SECRET` in production. Log warning clearly. Already logged, but should fail startup if truly in production mode.

### MEDIUM

**QA-M1: Dynamic WHERE Clause Uses .format() Instead of Parameterized Queries**
- **File**: `backend/live_data.py:1088-1099`
- **Issue**: Prospect query builds WHERE clause with `.format()`. While inputs appear sanitized, this pattern is risky.
- **Fix**: Refactor to parameterized queries with `?` placeholders.

**QA-M2: Missing Input Validation on Draft Year / Season Range**
- **File**: `backend/server.py:417`, `backend/live_data.py:1092`
- **Issue**: `draft_year` not validated for range. Could cause slow queries.
- **Fix**: Validate between 2000 and current_year + 1.

**QA-M3: Error Messages May Leak Implementation Details**
- **File**: `backend/auth.py:135-137`
- **Issue**: Generic exception catch returns `str(e)` to client, potentially leaking DB schema info.
- **Fix**: Return generic error message, log detailed error server-side.

**QA-M4: Home Page Says "War Room — Coming Soon" But Page Is Live**
- **File**: `frontend/index.html:705`
- **Issue**: War Room demo section header says "Coming Soon" but `/agents.html` is fully functional.
- **Fix**: Update to "The War Room" or "The War Room — Beta".

### LOW

**QA-L1: Imports Inside Function Bodies**
- **File**: `backend/server.py:245-251`
- **Issue**: `import urllib.request, json` inside endpoint function.
- **Fix**: Move to top of file.

**QA-L2: Null Guard Missing in Formula Scoring**
- **File**: `frontend/lab.js:1537-1538`
- **Issue**: Formula weight calc doesn't handle null stat values.
- **Fix**: Add `if (val != null)` guard.

**QA-L3: Hardcoded Stripe URLs**
- **File**: `backend/billing.py:29-30`
- **Issue**: Success/cancel URLs hardcoded to `https://razzle.lol`.
- **Fix**: Read from env var for multi-environment support.

---

## UX FINDINGS

### CRITICAL

*None* — All core user flows are functional.

### HIGH

**UX-H1: War Room API Key Wall Not Explained Upfront**
- **Where**: `/agents.html` scenario panel
- **Issue**: User types a scenario, clicks "Run All Agents", then gets blocked because no API key is configured. No upfront messaging about the requirement.
- **Fix**: Show a prominent notice above the scenario input: "Requires OpenRouter API key" with a link to get one. Or disable the Run button until API key is set.

**UX-H2: War Room "Run All Agents" Fails Silently Without API Key**
- **Where**: `/agents.html` scenario execution
- **Issue**: If no API key is set, the error appears as a red card per agent but the user doesn't understand why.
- **Fix**: Check for API key before executing. Show clear error: "Set your API key in the config panel to run agents."

**UX-H3: No Default Preset for First-Time Lab Users**
- **Where**: `/lab.html` initial load
- **Issue**: First-time users see all available columns, which can be overwhelming. Presets exist but aren't auto-selected.
- **Fix**: Detect first visit (localStorage flag), auto-load "ppr" preset, show a brief "try a preset" hint.

### MEDIUM

**UX-M1: Zero Values Displayed for Prospects in NFL Columns**
- **Where**: Lab table, prospect universe
- **Issue**: Prospects with no NFL stats show `0` instead of `—` or blank.
- **Fix**: Display `—` for null/zero stats where the player hasn't played.

**UX-M2: Pixel Canvas Purpose Unclear**
- **Where**: `/agents.html` War Room canvas
- **Issue**: The pixel agents walk around but users don't know if they're interactive or just decorative.
- **Fix**: Add subtle tooltip or label: "click an agent to follow them" or similar.

**UX-M3: Agent Bio Cards Dense on Mobile**
- **Where**: Home page agent bios
- **Issue**: 6 agent cards with specialty text are hard to scan on small screens.
- **Fix**: Consider collapsible accordion on mobile or fewer details.

### LOW

**UX-L1: War Room Dark Mode Is Jarring Transition**
- **Where**: Navigation from Lab (sand bg) to War Room (dark bg)
- **Issue**: Abrupt visual shift. By design per DESIGN.md exception.
- **No action needed** — intentional design choice.

**UX-L2: No Live Lab Preview on Home Page**
- **Where**: `index.html` feature section
- **Issue**: Home page describes the Lab but doesn't show it. A screenshot or embedded mini-view would be compelling.
- **Fix**: Add a static Lab screenshot image to the features section.

---

## SUMMARY

| Severity | QA | UX | Total |
|----------|----|----|-------|
| CRITICAL | 1 | 0 | 1 |
| HIGH | 4 | 3 | 7 |
| MEDIUM | 4 | 3 | 7 |
| LOW | 3 | 2 | 5 |

**Priority fixes**: QA-C1 (XSS), UX-H1+H2 (War Room API key messaging), UX-H3 (Lab default preset), QA-H3 (rate limiting).
