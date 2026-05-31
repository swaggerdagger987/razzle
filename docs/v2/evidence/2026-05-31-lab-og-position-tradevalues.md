# Evidence — Lab OG position filter (trade values)

**Cycle:** 100  
**Slice:** `lab-og-position-tradevalues`

## Gate C

```text
curl 'http://localhost:3000/og/tradevalues?download=1&position=WR'
→ 200 51115 bytes PNG 1200×630
```

## Tests

- `npm run build --workspace=apps/web` — exit 0
- `pytest apps/api/tests -q` — 51 passed

## Verdict

PASS
