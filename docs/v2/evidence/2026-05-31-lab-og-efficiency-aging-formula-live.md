# Evidence — lab-og-efficiency-aging-formula-live (cycle 150)

**Date:** 2026-05-31  
**Atom:** Efficiency + Aging OG — formula_score priority on live fetch

## Commands (executed)

```text
pytest apps/api/tests/test_og_launch10_formula_live.py -q --noconftest → 5 passed
npm run build --workspace=apps/web → exit 0
curl efficiency → 200 64569
curl aging → 200 63841
```

## Reality

- PASS — PNG ≥40KB on both Launch-10 OG routes; pytest guards formula_score before ppo/ppg.
