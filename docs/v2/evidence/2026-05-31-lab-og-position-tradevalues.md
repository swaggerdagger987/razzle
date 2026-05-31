# Evidence — Lab OG position filter on trade values (cycle 98)

**Date:** 2026-05-31  
**Atom:** `lab-og-position-tradevalues-prospects`  
**Verdict:** PASS (Gate C)

## Change

`TradeValuesRenderer` passes `position={position || undefined}` on `LabOgExportLink` so OG route receives the same filter as the in-panel tab. Prospects already wired on base — verified, not modified.

## Commands (executed)

```text
npm run build --workspace=apps/web  → exit 0
curl tradevalues?download=1&position=WR → 200 62120
curl prospects?download=1&position=WR   → 200 49000
file → PNG 1200×630 both paths
```

## Gate C

| Route | HTTP | Bytes | PNG |
|-------|------|-------|-----|
| `/og/tradevalues?download=1&position=WR` | 200 | 62120 | yes |
| `/og/prospects?download=1&position=WR` | 200 | 49000 | yes |

Both ≥ 40KB with position-scoped demo/live rows.
