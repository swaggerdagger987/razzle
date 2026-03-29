# S0-008: Navigation tabs use wrong brand names (Screener/Bureau/AI Agents)

**Severity**: S0 (Critical)
**Category**: ux
**Source**: TICKETS.md P0 "Restore original nav names"
**Found**: 2026-03-28
**Status**: OPEN

## Root Cause (UPDATED 2026-03-29 — code investigation)

`frontend/app.js:164-166` — The nav builder defines link labels:

```javascript
// app.js:164-166 (current state)
{ href: "/lab.html", label: "Fourth Down Lab" },           // NOW CORRECT
{ href: "/league-intel.html", label: "Bureau of Intelligence" }, // NOW CORRECT
{ href: "/agents.html", label: "Situation Room" },         // CORRECT
```

**Remaining mismatches** (nav text vs page H1):
- **lab.html** — Nav says "Fourth Down Lab" (app.js:164), but page H1 (`lab.html:3180`) says `<h1 class="sr-only">Razzle Screener — Fantasy Football Research Lab</h1>` and sidebar text (`lab.html:3198, 3213`) says "The Screener"
- **agents.html** — Nav says "Situation Room" (app.js:166), but page H1 (`agents.html:1618`) says `<h1>The <span>Situation Room</span></h1>` (includes "The")
- **404.html:141-143** — Fallback nav links may still use old labels

Additional references that may use old names:
- `frontend/about.html:258` — may still reference "The Lab"
- `frontend/lab.html` `<title>` tag — check if updated

## Fix

1. Update `app.js:162-164` nav labels to exact brand names
2. Grep all HTML/JS for "Screener", "The Lab", "Bureau" (without "of Intelligence"), "AI Agents", "League Intel" and replace with correct names:
   - "Fourth Down Lab" (not "Lab", "The Lab", "Screener")
   - "Bureau of Intelligence" (not "Bureau", "League Intel")
   - "Situation Room" (not "AI Agents")
3. Update all `<title>` tags on lab.html, league-intel.html, agents.html

## Files to Change

- `frontend/app.js:162-164` — nav labels
- `frontend/404.html:141-143` — fallback nav links
- `frontend/about.html:258` — reference text
- `frontend/lab.html` — `<title>` tag
- Any other files found via grep

## Accept When

1. All nav links show "Fourth Down Lab", "Bureau of Intelligence", "Situation Room"
2. All `<title>` tags match
3. All H1/H2 headers match
4. Grep for "Screener", "League Intel", "AI Agents" returns zero results in user-facing strings (code comments OK)

## Do NOT Touch

- URL paths (`/lab.html`, `/league-intel.html`, `/agents.html`) — those stay as-is
- Internal variable names — only user-facing text
