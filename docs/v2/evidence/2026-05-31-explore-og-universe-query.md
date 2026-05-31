# Evidence — explore-og-universe-query

**Date:** 2026-05-31  
**Atom:** `explore-og-universe-query`  
**Route:** `/og/explore`

## Gate C — curl (demo fallback)

```text
curl NFL force_demo=1 → 200 60059 bytes
curl college force_demo=1 → 200 62556 bytes
```

PNG ≥ 40KB with six demo rows per universe (NFL FPTS / college yards).

## Build

`npm run build --workspace=apps/web` — exit 0

## API

`JWT_SECRET=test pytest apps/api/tests/test_smoke.py` — 3 passed

## Verdict

PASS — demo fallback replaces empty shell on cold screener API; preserves season/team query params from base.
