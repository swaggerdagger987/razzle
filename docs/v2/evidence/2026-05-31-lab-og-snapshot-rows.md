# Evidence — Lab L5 OG in-panel snapshot rows

**Date:** 2026-05-31  
**Slice:** `lab-og-snapshot-rows` — dashboard export mirrors risers/fallers on card

| Check | Result |
|-------|--------|
| Build | `npm run build --workspace=apps/web` → exit 0 |
| API tests | `JWT_SECRET=test pytest apps/api/tests -q` → 51 passed, 5 skipped |
| OG snapshot curl | `curl /og/dashboard?download=1&snapshot=…` → **200 45249** bytes PNG |
| PNG type | `file` → PNG 1200×630 |
| Subtitle | Card shows "from your panel" when snapshot param present |

**Verdict:** PASS — snapshot rows render on OG card; demo fallback unchanged when no snapshot/live API.
