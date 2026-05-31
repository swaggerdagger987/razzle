# Evidence — League L5 Bureau H2H copy link

**Date:** 2026-05-31  
**Slice:** Head-to-Head copy link + export row (Explore parity)

| Check | Result |
|-------|--------|
| `npm run build --workspace=apps/web` | exit 0 |
| `JWT_SECRET=test pytest apps/api/tests -q` | 51 passed, 5 skipped |
| `curl /og/head-to-head?download=1` | **200 59305** bytes PNG |
| `file` | PNG 1200×630 |

**UI:** Bureau Head-to-Head shows `copy link` + `export card` in one row when roster linked.

**Follow-up:** Self-Scout + Monte Carlo copy link (epic atoms 2–3). H2H OG Satori blurb fix (single text child).

**Verdict:** PASS
