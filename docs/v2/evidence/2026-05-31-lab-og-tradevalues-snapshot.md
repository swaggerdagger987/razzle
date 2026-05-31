# Evidence — Lab L5 trade values OG snapshot export

**Date:** 2026-05-31  
**Atom:** `lab-og-tradevalues-snapshot`  
**Slice:** Trade values export encodes visible chart rows

## Acceptance

| Check | Result |
|-------|--------|
| `npm run build --workspace=apps/web` | PASS |
| `pytest apps/api/tests -q` | 51 passed |
| OG demo `/og/tradevalues?download=1` | 200, 62488 bytes PNG |
| OG snapshot param | 200, 62488 bytes PNG |

## Change

`TradeValuesRenderer` passes top-6 `snapshotRows` (trade value or formula composite) and `position` to `LabOgExportLink`.

## Verdict

**PASS** — Gate C satisfied (PNG ≥40KB).
