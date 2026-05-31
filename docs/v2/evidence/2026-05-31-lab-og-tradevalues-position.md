# Evidence — Lab OG trade values position filter

**Date:** 2026-05-31  
**Atom:** `lab-og-position-tradevalues-prospects`

## Change

`TradeValuesRenderer` passes `position` to `LabOgExportLink`.

## Verdict

PASS — `npm run build --workspace=apps/web` exit 0; curl tradevalues WR 51115B.
