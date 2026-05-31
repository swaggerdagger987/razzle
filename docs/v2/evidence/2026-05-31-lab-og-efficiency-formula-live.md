# Evidence — lab-og-efficiency-formula-live

**Date:** 2026-05-31  
**Atom:** `lab-og-efficiency-formula-live` — Efficiency OG live extract prefers formula_score over PPO  
**Epic:** Lab L5 — OG formula parity (efficiency + aging) (atom 1/2)

## Change

- `extractRows` uses `efficiencyStatKeys` with `formula_score` before `ppo` when slug is `efficiency`.
- `agingStatKeys` wired for atom 2 (same PR file; aging tested in pytest guard only).

## Verification

```text
pytest apps/api/tests/test_og_launch10_formula_live.py -q  → 5 passed
npm run build --workspace=apps/web                         → exit 0
curl /og/efficiency?download=1&force_demo=1                → 200 64347 PNG
```

**Reality:** PASS
