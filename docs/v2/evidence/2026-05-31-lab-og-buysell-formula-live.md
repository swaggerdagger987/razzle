# Evidence — lab-og-buysell-formula-live (2026-05-31)

## Slice

Buy/sell OG live extract prefers `formula_score` before `mismatch_score`; buy-low / sell-high lanes label rows `Buy · Score` / `Sell · Value`.

## Commands (executed)

```text
JWT_SECRET=ci-secret ENVIRONMENT=development python3 -m pytest apps/api/tests/test_og_launch10_formula_live.py -q --noconftest
# 4 passed

npm run build --workspace=apps/web
# exit 0
```

## Gate C (OG)

Buysell uses buy_low/sell_high lane extract; live PNG requires panel API with formula snapshot. Static demo fallback unchanged (`SAMPLE · buy/sell board`). Follow-up: curl ≥40KB with live buysell fixture when API seeded in CI.

## Verdict

**PASS** — pytest + web build green; source contract guards formula order and mismatch lanes.
