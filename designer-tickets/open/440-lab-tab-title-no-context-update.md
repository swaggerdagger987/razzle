---
id: DQ-440
priority: P3
area: frontend/lab.js
section: browser UX / discoverability
type: missing contextual feedback
status: open
cycle: 56
---

# Lab screener tab title doesn't reflect active filters or search context

## What's wrong

The Lab page title updates when switching universes (lab.js:2846-2848):
- "Screener — Razzle" (NFL)
- "College Screener — Razzle" (College)
- "Prospect Screener — Razzle" (Prospects)

But it never reflects the active position filter, search term, or applied filters. A user with 8 browser tabs open sees "Screener — Razzle" on all of them, even if one is filtered to QBs and another to dynasty rankings.

Compare with player.js which DOES update: `"Patrick Mahomes (QB) — Razzle"`

## Where

- `frontend/lab.js:2846-2848` — title only set on universe switch
- `frontend/lab.js:3826-3875` — `saveStateToURL()` updates URL but not title

## Fix

In `saveStateToURL()` or after `fetchAndRender()`, update the title with context:
```js
var parts = [];
if (state.position && state.position !== 'ALL') parts.push(state.position);
if (state.search) parts.push('"' + state.search + '"');
parts.push(state.universe === 'college' ? 'College Screener' :
           state.universe === 'prospects' ? 'Prospect Screener' : 'Screener');
parts.push('Razzle');
document.title = parts.join(' — ');
```

Result: "QB — Screener — Razzle" or "Mahomes — QB — Screener — Razzle"

## Not a duplicate of

- DQ-295: covers homepage `<title>` missing "Free" — different page, different issue

## Why this matters

Multi-tab users (common among fantasy football power users during game day) can't distinguish between their open Razzle tabs. Contextual titles let them find the right tab instantly.
