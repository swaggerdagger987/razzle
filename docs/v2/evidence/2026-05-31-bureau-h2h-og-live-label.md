# Evidence — Bureau H2H OG live rivalry data label

**Date:** 2026-05-31  
**Slice:** `bureau-h2h-og-live-label` — `/og/head-to-head` labels live API matchups

| Check | Result |
|-------|--------|
| `npm run build --workspace=apps/web` | exit 0 |
| `pytest apps/api/tests -q` | 51 passed, 5 skipped |
| `curl /og/head-to-head?download=1` | **200 59305** bytes PNG (1200×630) |
| Demo path | ` · sample preview` when API empty |
| Live path | ` · live rivalry data` when `fetchH2H` returns you/them |

**Verdict:** PASS — Gate C2 satisfied; T1 honest live vs sample labeling on Bureau H2H OG.
