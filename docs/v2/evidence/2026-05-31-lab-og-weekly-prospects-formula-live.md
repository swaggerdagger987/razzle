# Evidence — Lab L5 weekly + prospects OG formula_score live

**Date:** 2026-05-31  
**Atom:** `lab-og-weekly-prospects-formula-live`  
**Route:** `/og/weekly`, `/og/prospects`

## Acceptance

| Check | Result |
|-------|--------|
| pytest `test_og_launch10_formula_live.py` | 7 passed |
| `npm run build --workspace=apps/web` | exit 0 |
| `curl /og/weekly?download=1` | `200 70018` PNG |
| `curl /og/prospects?download=1` | `200 63453` PNG |

## Verdict

**PASS** — Gate C2 satisfied (PNG ≥ 40KB, live row layout).
