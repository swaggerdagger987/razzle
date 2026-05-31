# Evidence — Lab L5 OG export links (prospects, weekly, tradevalues)

**Date:** 2026-05-31  
**Slice:** `LabOgExportLink` footers on Big Board, Weekly Heatmap, Trade Values

| Check | Result |
|-------|--------|
| Build | `npm run build --workspace=apps/web` exit 0 |
| API tests | `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped |
| `/og/prospects?download=1` | 200 **58084** bytes PNG |
| `/og/weekly?download=1` | 200 **63819** bytes PNG |
| `/og/tradevalues?download=1` | 200 **62488** bytes PNG |

**Verdict:** PASS — Gate C2 satisfied (PNG ≥40KB with row layout).

**Note:** Renderer footers landed on base via parallel merge; this cycle records factory verification + evidence.
