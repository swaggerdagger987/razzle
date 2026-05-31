# Evidence — Lab OG tradevalues position filter

**Date:** 2026-05-31  
**Atom:** `lab-og-position-tradevalues-prospects`  
**Verdict:** PASS (Gate C)

## Gate C — OG PNG

```text
curl /og/tradevalues?position=WR&download=1 → 200 51115 bytes (PNG)
```

## Tests

- `npm run build --workspace=apps/web` — PASS
- `pytest apps/api/tests -q` — 51 passed
