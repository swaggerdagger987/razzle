# Evidence — lab-efficiency-formula-og-live

**Date:** 2026-05-31  
**Atom:** `lab-efficiency-formula-og-live`  
**Epic:** Lab L5 — Launch-10 OG formula_score stat parity (atom 1/4)

## Verification

| Check | Result |
|-------|--------|
| `pytest apps/api/tests/test_og_launch10_formula_live.py -q` | 4 passed |
| `npm run build --workspace=apps/web` | exit 0 |
| `curl /og/efficiency?download=1&position=RB` | `200 56044` PNG 1200×630 |

## Verdict

**PASS** — FACTORY-DOD Gate C. Efficiency OG live extract prefers `formula_score` before `ppo`; panel snapshot uses Score label when formula active.
