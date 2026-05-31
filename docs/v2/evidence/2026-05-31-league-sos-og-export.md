# Evidence — league-sos-og-export

**Date:** 2026-05-31  
**Atom:** `league-sos-og-export`  
**Dedup:** `league-strength-of-schedule-tab` already on base `eb542d51` — advanced to atom 2.

## Gate C

```text
curl /og/strength-of-schedule?download=1&league=demo&user=demo
→ 200 55540 bytes; PNG 1200x630
```

## Build

```text
npm run build --workspace=apps/web → exit 0
pytest apps/api/tests -q → 51 passed
```
