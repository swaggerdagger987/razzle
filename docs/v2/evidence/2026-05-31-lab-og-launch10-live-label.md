# Evidence — Lab L5 OG launch-10 live label

**Date:** 2026-05-31  
**Atom:** `lab-og-launch10-live-label`  
**Route:** `/og/[panel]` (launch-10 slugs)

## Changes

- `LAUNCH_10_OG_SLUGS` + `panelBlurbSuffix()` — sample preview only when `isDemo`; launch-10 with live API rows omit sample and extra live-data suffix.
- `namedLiveRows` filter — live rows require non-empty names before dropping demo fallback.

## Verification

| Command | Result |
|---------|--------|
| `npm run build --workspace=apps/web` | exit 0 |
| `JWT_SECRET=test python3 -m pytest apps/api/tests -q` | 51 passed, 5 skipped |
| `curl /og/rankings?download=1` | **200 59509** PNG 1200×630 |
| `curl /og/breakouts?download=1` | **200 60649** PNG 1200×630 |

**Verdict:** PASS — Gate C2 satisfied (PNG ≥40KB with player rows). Launch-10 live path no longer appends `sample preview` when API returns named rows.
