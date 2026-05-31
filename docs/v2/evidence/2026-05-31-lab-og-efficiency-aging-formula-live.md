# Evidence — lab-og-efficiency-aging-formula-live (2026-05-31)

**Atom:** `lab-og-efficiency-aging-formula-live`  
**Epic:** Lab L5 — formula-sorted OG live parity (atom 3/3 — epic complete)

## Acceptance

```text
pytest apps/api/tests/test_og_launch10_formula_live.py -q --noconftest → 5 passed
npm run build --workspace=apps/web → exit 0
curl /og/efficiency?download=1&force_demo=1 → 200 64569
curl /og/aging?download=1&force_demo=1 → 200 63841
```

## Change

- `efficiencyStatKeys` / `agingStatKeys` in `apps/web/app/og/[panel]/route.tsx` — `formula_score` before `ppo` / `ppg`
- pytest guards in `test_og_launch10_formula_live.py`

## Gate C

PASS — PNG ≥40KB (64569B / 63841B), 1200×630.

## Trust

T5, T6
