# S3-016: POS_COLORS defined 3 times — consolidate to one source

**Severity**: S3 (Low)
**Category**: ui-bug
**Source**: EDGE-CASES.md #64
**Found**: 2026-03-14
**Status**: OPEN

## Root Cause (UPDATED 2026-03-29 — code investigation)

Position colors are defined in **3 primary locations** plus 1 secondary:

### Primary definitions:
1. **CSS variables (single source of truth)** — `frontend/styles.css:41-44`:
   - `--pos-qb: #5b7fff;` / `--pos-rb: #2ec4b6;` / `--pos-wr: #d97757;` / `--pos-te: #8b5cf6;`

2. **JavaScript fallback defaults** — `frontend/app.js:674-677`:
   - `getPosColors()` function reads CSS vars with hardcoded hex fallbacks

3. **Lab CSS var references** — `frontend/lab.js:5`:
   - `_POS_COLORS_CSS = { QB: "var(--pos-qb)", ... }` — CSS variable string references
   - `lab.js:33-36`: `_getPosColorsHex()` reads computed CSS var values at runtime

### Secondary (reuses palette):
4. **Agent config** — `frontend/agent-config.js:10,38,66,150`:
   - Agent colors reuse the position color hex values

### Architecture assessment:
The current pattern is actually reasonable: CSS is the source of truth, `app.js` provides fallbacks for when CSS vars aren't available (e.g., canvas contexts), and `lab.js` reads from CSS at runtime. The original ticket citing `compare.js`, `player.js`, `charts.js` may have been resolved in a prior cleanup.

## Fix

Verify that `compare.js`, `player.js`, and `charts.js` now use `getPosColors()` from app.js rather than hardcoded hex values. If so, this ticket can be closed.

## Files to Check

- `frontend/styles.css:41-44` — CSS source of truth
- `frontend/app.js:674-677` — `getPosColors()` with fallbacks
- `frontend/lab.js:5,33-36` — CSS var references and runtime reader
- `frontend/compare.js`, `player.js`, `charts.js` — verify no duplicate definitions remain

## Accept When

`POS_COLORS` defined exactly once. All three consumer files reference the shared definition.
