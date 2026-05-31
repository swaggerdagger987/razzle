# Evidence — Lab OG snapshot tradevalues + prospects

**Date:** 2026-05-31  
**Atom:** `lab-og-snapshot-tradevalues-prospects`  
**Verdict:** PASS

## Build

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped

## OG curl (snapshot param — in-panel rows)

Fixture snapshot: 2-row base64url JSON (`RPS` labels).

| Route | HTTP | Bytes | Notes |
|-------|------|-------|-------|
| `/og/tradevalues?download=1&snapshot=…` | 200 | 62488 | PNG 1200×630 |
| `/og/prospects?download=1&snapshot=…` | 200 | 58084 | PNG 1200×630 |

## Dashboard (pre-existing snapshot wire)

| Route | HTTP | Bytes |
|-------|------|-------|
| `/og/dashboard?download=1&snapshot=…` | 200 | 44792 |

All ≥40KB — real row layout, not loading-copy shell.
