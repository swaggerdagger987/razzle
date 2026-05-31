# Evidence — Lab L5 OG position on trade values + efficiency

**Date:** 2026-05-31  
**Atom:** `lab-og-position-tradevalues-prospects`  
**Verdict:** PASS

## Changes

- `TradeValuesRenderer` — `position={position || undefined}` on `LabOgExportLink`
- `EfficiencyRenderer` — same (closes atom-1 efficiency gap)
- Dedup: `ProspectsRenderer` already on base

## Commands

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  # 51 passed, 5 skipped
curl 'http://localhost:3000/og/tradevalues?download=1&position=WR'  # 200 51115
curl 'http://localhost:3000/og/efficiency?download=1&position=RB'  # 200 45113
```
