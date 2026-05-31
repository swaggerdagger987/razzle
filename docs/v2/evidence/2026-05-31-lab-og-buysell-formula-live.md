# Evidence — lab-og-buysell-formula-live (2026-05-31)

**Atom:** `lab-og-buysell-formula-live` — buysell OG prefers formula_score over mismatch_score  
**Route:** `/og/buysell?download=1`

## Gate C — curl

| Request | HTTP | Bytes | Verdict |
|---------|------|-------|---------|
| `?download=1` | 200 | 63936 | PASS ≥40KB PNG |

## Build

- `JWT_SECRET=test python3 -m pytest apps/api/tests/test_og_launch10_formula_live.py -q` — 3 passed
- `npm run build --workspace=apps/web` — exit 0

## Change

`buysellStatKeys` in `/og/[panel]/route.tsx` — formula_score before mismatch_score; buy_low/sell_high merge unchanged.
