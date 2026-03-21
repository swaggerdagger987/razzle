# FUNC-016: Two inline onclick handlers use escapeHtml instead of escapeAttr

**Severity**: P2
**Flow**: Cheat Sheet (flow 24), Scoring (flow N/A - standalone)
**Status**: VERIFIED FIXED (Session 20 — data-pid + addEventListener pattern applied, pending deploy)

## Problem

Session 18 Ship Loop fixed XSS in matchups.html (inline onclick -> data-pid + addEventListener) and formula-store.js (parseInt sanitization). Two similar patterns remain:

1. `cheatsheet.html:453` — `onclick="window.location.href=\'/player.html?id=' + escapeHtml(p.player_id) + '\'">`
2. `scoring.html:491` — `onclick="window.location.href=\'/player.html?id=' + escapeHtml(p.player_id) + '\'">`

Both use `escapeHtml()` inside single-quoted JavaScript strings within onclick attributes. `escapeHtml()` uses the DOM `textContent->innerHTML` trick, which escapes `<`, `>`, `&`, `"` but does **NOT** escape single quotes (`'`).

## Why This Matters

- **Practical risk: near-zero.** nflverse player IDs are `00-XXXXXXX` format (digits and dashes only). No single quotes possible from the data source.
- **Consistency issue.** The Ship Loop applied `escapeAttr()` (which handles `'` via `&#39;`) to the same pattern in matchups.html and lab.js. These two files were missed.
- **Defense-in-depth.** If a new data source ever introduced player IDs with special characters, these would be the only unprotected injection points.

## Fix

Option A (quick): Replace `escapeHtml` with `escapeAttr` in both lines. Both functions are globally available.

Option B (better): Replace inline onclick with data-pid + addEventListener, matching the matchups.html pattern from Session 18.

## Files

- `frontend/cheatsheet.html:453`
- `frontend/scoring.html:491`
