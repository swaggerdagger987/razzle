# S0-008: Navigation tabs use wrong brand names (Screener/Bureau/AI Agents)

**Severity**: S0 (Critical)
**Category**: ux
**Source**: TICKETS.md P0 "Restore original nav names"
**Found**: 2026-03-28
**Status**: OPEN

## Root Cause

`frontend/app.js:162-164` — The nav builder uses abbreviated names instead of the full brand names. These are brand identity, not descriptions.

```javascript
// app.js:162-164
{ href: "/lab.html", label: "Screener" },          // WRONG — should be "Fourth Down Lab"
{ href: "/league-intel.html", label: "Bureau" },    // WRONG — should be "Bureau of Intelligence"
{ href: "/agents.html", label: "Situation Room" },  // CORRECT
```

Additional wrong references:
- `frontend/404.html:141` — `<a href="/lab.html">Screener</a>`
- `frontend/404.html:142` — `<a href="/league-intel.html">Bureau</a>`
- `frontend/404.html:143` — `<a href="/agents.html">AI Agents</a>` (should be "Situation Room")
- `frontend/about.html:258` — refers to "The Lab" (should be "Fourth Down Lab")
- `frontend/lab.html` `<title>` tag — "Screener — Razzle" (should be "Fourth Down Lab — Razzle")

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
