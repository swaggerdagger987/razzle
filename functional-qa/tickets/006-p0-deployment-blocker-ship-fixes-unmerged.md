---
id: FUNC-006
severity: P0
flow: 1, 5, 18 (all re-audits)
status: OPEN
file: ship/launch-fixes branch
function: deployment pipeline
created: 2026-03-20
---

# P0: Ship Loop fixes not deployed — Lab still broken on production

## What's broken

The Ship Loop (branch `ship/launch-fixes`) fixed three tickets:
- **FUNC-001**: Removed GZipMiddleware to prevent double-compression with Cloudflare Brotli (commit `4f692c8`)
- **FUNC-002**: Fixed search for hyphens/apostrophes/periods (commit `0f19a65`)
- **FUNC-003**: Fixed dynasty value ceiling clustering at 100.0 with soft cap (commit `d8feb5e`)

**None of these fixes are deployed to production.** The `ship/launch-fixes` branch was never merged to `master`. Production still runs the old code.

## Evidence

Tested 2026-03-20 against https://razzle.lol:

1. **FUNC-001 still broken**: Lab page crashes with "Server returned non-JSON response" → populateSeasonSelect crash → 0 player rows. Response headers show `Content-Encoding: br` (Cloudflare Brotli) wrapping server GZip = double compression.
2. **FUNC-002 still broken**: `POST /api/screener/query {"search":"Amon-Ra"}` → 0 results. `{"search":"Ja'Marr"}` → 0 results.
3. **FUNC-003 still broken**: `/api/dynasty-rankings` → top 7 players all at 100.0 dynasty value.

## Impact

- **The Lab is completely unusable on production.** Zero player rows render.
- The main product feature (screener) does not work for any visitor to razzle.lol.
- Search for ~15% of NFL players (those with hyphens/apostrophes/periods in names) returns nothing.
- Dynasty rankings have reduced usefulness due to ceiling clustering.

## Fix

**Human action required:**
1. Merge `ship/launch-fixes` into `master`
2. Push `master` to trigger Render deploy
3. Verify Lab loads on razzle.lol after deploy

```bash
git checkout master
git merge ship/launch-fixes
git push origin master
```

## Verification

After deploy:
```bash
# FUNC-001: Lab page should have 0 JS errors
RAZZLE_URL=https://razzle.lol node functional-qa/browse.js errors lab.html

# FUNC-002: Search should find Amon-Ra
curl -s -X POST "https://razzle.lol/api/screener/query" -H "Content-Type: application/json" -d '{"search":"Amon-Ra","limit":5}'

# FUNC-003: Top player should be < 100.0
curl -s "https://razzle.lol/api/dynasty-rankings?limit=3"
```
