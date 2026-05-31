# Evidence — League L5 Power Rankings OG card

**Date:** 2026-05-31  
**Slice:** `league-power-rankings-og` — `/og/power-rankings` with demo fallback

| Check | Result |
|-------|--------|
| Web build | `npm run build --workspace=apps/web` — exit 0 |
| API tests | `JWT_SECRET=test pytest apps/api/tests -q` — 52 passed, 4 screener snapshot fails (pre-existing) |
| OG PNG | `curl localhost:3000/og/power-rankings?download=1` → **200 65571** bytes |
| file | PNG 1200×630 |

**Verdict:** PASS — Gate C satisfied with labeled sample preview rows.
