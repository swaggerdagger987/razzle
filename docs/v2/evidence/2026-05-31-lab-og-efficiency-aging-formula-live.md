# Evidence — lab-og-efficiency-aging-formula-live (cycle 157)

**Date:** 2026-05-31  
**Atom:** Efficiency + Aging OG — formula_score priority on live fetch

## Commands

```text
pytest apps/api/tests/test_og_launch10_formula_live.py -q → 5 passed
npm run build --workspace=apps/web → exit 0
curl /og/efficiency → 200 ≥40KB
curl /og/aging → 200 ≥40KB
```

## Reality

PASS — formula_score precedes ppo/ppg in efficiencyStatKeys and agingStatKeys.
