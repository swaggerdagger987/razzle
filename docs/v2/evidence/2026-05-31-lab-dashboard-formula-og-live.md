# Evidence — lab-dashboard-formula-og-live

**Date:** 2026-05-31  
**Atom:** `lab-dashboard-formula-og-live`  
**Epic:** Lab L5 — Launch-10 OG formula_score stat parity (atom 4/4)

## Verification

| Check | Result |
|-------|--------|
| `pytest test_dashboard_live_extract_prefers_formula_score -q` | 1 passed |
| `npm run build --workspace=apps/web` | exit 0 |
| `curl /og/dashboard?download=1` | `200 66547` PNG 1200×630 |

## Verdict

**PASS** — Dashboard OG live extract uses `dashboardStatKeys` with `formula_score` before `rank_diff` on top5/risers/fallers rows.
