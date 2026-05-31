# Evidence — lab-og-position-tradevalues-prospects

**Date:** 2026-05-31  
**Atom:** `lab-og-position-tradevalues-prospects` (trade values leg)  
**Verdict:** PASS (Reality)

## Change

- `TradeValuesRenderer.tsx` — `LabOgExportLink` now passes `position={position || undefined}` (matches Prospects + Aging pattern on base).

## Acceptance

| Check | Result |
|-------|--------|
| `npm run build --workspace=apps/web` | exit 0 |
| `pytest tests -q` | 51 passed |

## Gate C

OG route already honors `position` query param (`apps/web/app/og/[panel]/route.tsx`). Export href includes `position=WR` when WR tab selected.
