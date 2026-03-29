# S1-022: SUPERSEDED by S0-008

**Status**: superseded
**Superseded by**: `tickets/ux/S0-008-nav-uses-wrong-brand-names.md`
**Reason**: S0-008 covers the same nav label/brand name inconsistency at higher severity with confirmed file:line root causes (app.js:164-166, lab.html:3180, agents.html:1618).

---

*Original content below for reference:*

# S1-022: Nav labels mismatch page titles

**Severity**: S1 (Major)
**Category**: ux-flow
**Source**: Deep Audit 2026-03-28, finding S1-010

## Problem

The navigation bar uses abbreviated/different names than the actual page titles,
creating cognitive friction for new users:

| Nav Label | Page Title | Page |
|-----------|-----------|------|
| Screener | Razzle Screener — Fantasy Football Research Lab | lab.html |
| Bureau | Bureau of Intelligence | league-intel.html |
| AI Agents | The Situation Room | agents.html |

The landing page (index.html) mixes both naming conventions across sections.

## Root Cause

- `frontend/app.js:162` — `{ href: "/lab.html", label: "Screener" }`
- `frontend/app.js:163` — `{ href: "/league-intel.html", label: "Bureau" }`
- `frontend/app.js:164` — `{ href: "/agents.html", label: "Situation Room" }`
  Note: app.js says "Situation Room" but agents.html local nav says "AI Agents"

- `frontend/league-intel.html:7` — `<title>Bureau of Intelligence — Razzle</title>`
- `frontend/league-intel.html:2541` — `<h1>Bureau of Intelligence — Razzle</h1>`

- `frontend/agents.html:7` — `<title>Situation Room — Razzle</title>`
- `frontend/agents.html:1616` — `<h1>The <span>Situation Room</span></h1>`
- `frontend/agents.html:1593` — local nav still says `"AI Agents"` (stale)

- `frontend/index.html:639-641` — footer nav uses "Screener", "Bureau", "AI Agents"
- `frontend/index.html:777` — section header says "Situation Room — Live Preview"

## Expected

Pick one canonical name for each product section and use it everywhere:
- "The Lab" or "Screener" (not both)
- "Bureau" or "Bureau of Intelligence" (not both)
- "Situation Room" or "AI Agents" (not both)

## Fix

1. Decide canonical names (suggest: "The Lab", "Bureau", "Situation Room")
2. Update `app.js:162-164` nav labels
3. Update `agents.html:1593` local nav link text
4. Update `index.html:639-641` footer nav
5. Audit all cross-references for consistency

## Scope

- 4 files: `app.js`, `agents.html`, `index.html`, `league-intel.html`
- ~10 line changes
