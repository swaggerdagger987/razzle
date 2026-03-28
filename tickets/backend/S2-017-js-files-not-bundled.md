---
id: S2-017
severity: S2
category: performance
finding_ref: EDGE-31
confidence: HIGH
---

# S2-017: 12 JS files served individually — no bundling

## Root Cause

`scripts/build_dist.py:29-34,45-47` — Build script only minifies and copies each JS
file individually. No bundling step exists.

`render.yaml:9-14` — Build command calls `python scripts/build_dist.py` which uses
rjsmin/rcssmin for minification only.

12 separate JS files are served as individual HTTP requests:
- lab-panels.js (541K), warroom.js (520K), charts.js (164K), lab.js (87K),
  app.js (57K), player.js (33K), formulas.js (25K), formula-store.js (14K),
  compare.js (31K), agent-config.js (8.4K), agent-nudges.js (8.5K), league-intel (inline)

Total: ~1.5MB pre-minify across 12 requests.

## What to Fix

Add esbuild (already referenced in comments) or a simple concatenation step to
`scripts/build_dist.py` that bundles JS files into 2-3 groups:

1. `core.js` — app.js + player.js + charts.js + formulas.js + formula-store.js + compare.js
2. `lab.js` — lab.js + lab-panels.js (only loaded on lab.html)
3. `warroom.js` — warroom.js + agent-config.js + agent-nudges.js (only on agents.html)

## Files to Change

- `scripts/build_dist.py` — Add concatenation/bundling step
- `frontend/lab.html` — Update script tags to reference bundled files
- `frontend/agents.html` — Update script tags
- `frontend/index.html` — Update script tags

## Acceptance Criteria

- [ ] Build produces 2-3 bundled JS files instead of 12 individual files
- [ ] Total number of JS requests per page load is <= 3
- [ ] All functionality works after bundling (no missing globals)
- [ ] Minification still applied after bundling

## Do NOT

- Do not add webpack or complex toolchain — simple concatenation + minify is sufficient
- Do not change module structure or add ES module imports
