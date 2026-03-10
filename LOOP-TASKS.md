# Razzle Loop — Phase 46 Task List

> QA + UX Audit — Auto-Generated Fixes (from Phases 41-45 audit)

**Current Phase**: 46 — QA + UX Audit Fixes
**Exit Criterion**: All CRITICAL and HIGH findings from QA-AUDIT.md fixed. Formula store XSS patched. War Room API key messaging clear. Lab first-visit default preset active. Auth rate limiting added. "Coming Soon" copy updated. Deployed to Render.

---

## Task 1: Fix QA-C1 — Formula store XSS (escape name/creator in innerHTML)
**Status**: PENDING
**Acceptance Criteria**:
- `formula.name` and `formula.creator` wrapped in `escapeHtml()` in formula-store.js
- No other unescaped user input rendered via innerHTML in formula-store.js
- XSS payload in formula name renders as text, not HTML

## Task 2: Fix UX-H1 + UX-H2 — War Room API key messaging
**Status**: PENDING
**Acceptance Criteria**:
- If no API key configured, scenario input shows a notice: "Set your OpenRouter API key to run agents"
- "Run All Agents" button disabled (grayed out) when no API key is set
- Clicking disabled button shows clear message
- Config panel prominently accessible
- Error card for missing API key says "No API key — open config panel to set one"

## Task 3: Fix UX-H3 — Lab first-visit default preset
**Status**: PENDING
**Acceptance Criteria**:
- First-time Lab visitor (no localStorage flag) auto-loads "ppr" preset
- Subsequent visits load user's last state
- A brief hint toast appears: "showing PPR preset — try others with the preset buttons"
- Toast dismisses after 5 seconds or on click
- localStorage flag `razzle_lab_visited` set after first load

## Task 4: Fix QA-H3 + QA-M3 + QA-M4 — Rate limiting, error messages, copy update
**Status**: PENDING
**Acceptance Criteria**:
- Auth endpoints (login/register) have basic rate limiting (IP-based, 10 attempts per minute)
- Generic error messages returned to client (no implementation details leaked)
- Home page "Coming Soon" updated to "The War Room" or similar
- auth.py exception handlers return generic messages

## Task 5: Fix MEDIUM issues — null formula guard, zero display, prospect queries
**Status**: PENDING
**Acceptance Criteria**:
- Formula scoring handles null stat values without NaN
- Prospects showing 0 for NFL stats display "—" instead
- dynamic WHERE clause in live_data.py uses parameterized queries where possible
- Draft year validated for range

## Task 6: Deploy + smoke test all fixes
**Status**: PENDING
**Acceptance Criteria**:
- All JS files pass syntax check
- All Python files import cleanly
- Formula store XSS fix verified
- War Room API key messaging visible
- Lab first-visit preset loads
- Committed and pushed to master

---

## Loop State
```
Current Phase: 46
Current Task: 1
Current Stage: BUILD
Attempt: 1
Tasks Completed: 0/6
```
