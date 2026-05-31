# Evidence — Lab L5 OG position on tradevalues, efficiency, buy/sell

**Date:** 2026-05-31  
**Atom:** `lab-og-position-tradevalues-efficiency-buysell`

## Changes

- `TradeValuesRenderer`, `EfficiencyRenderer`, `BuySellRenderer` — `position={position || undefined}` on `LabOgExportLink`
- `docs/v2/results.tsv` — removed merge conflict markers on base

## Gate C

| Route | HTTP | Bytes |
|-------|------|-------|
| `/og/tradevalues?position=WR` | 200 | 51115 |
| `/og/efficiency?position=WR` | 200 | 48610 |
| `/og/buysell?position=WR` | 200 | 44258 |

**Verdict:** PASS
