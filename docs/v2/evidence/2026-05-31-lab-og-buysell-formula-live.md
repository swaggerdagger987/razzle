# Evidence — lab-og-buysell-formula-live (2026-05-31)

**Atom:** `lab-og-buysell-formula-live`  
**Epic:** Lab L5 — formula-sorted OG live parity (atom 2/3)

## Acceptance

```text
pytest apps/api/tests/test_og_launch10_formula_live.py -q --noconftest → 3 passed
npm run build --workspace=apps/web → exit 0
curl /og/buysell?download=1&position=WR&force_demo=1 → 200 55234
```

## Change

- `extractBuySellRows` + `BUYSELL_STAT_KEYS` — formula_score before mismatch; Buy/Sell lane labels
- pytest guard in `test_og_launch10_formula_live.py`

## Gate C

PASS — PNG ≥40KB with demo buy/sell rows.

## Trust

T5, T6
