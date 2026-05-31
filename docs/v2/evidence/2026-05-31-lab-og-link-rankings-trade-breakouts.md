# Evidence — Lab L5 LabOgExportLink (rankings, tradevalues, breakouts)

**Date:** 2026-05-31  
**Atom:** `lab-og-link-rankings-trade-breakouts`

| Route | HTTP | Bytes |
|-------|------|-------|
| `/og/rankings?download=1` | 200 | 59509 |
| `/og/tradevalues?download=1` | 200 | 62488 |
| `/og/breakouts?download=1` | 200 | 60649 |

**Build:** `npm run build --workspace=apps/web` exit 0  
**API:** `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped

**Verdict:** PASS — PNGs ≥40KB with demo rows; footers use `LabOgExportLink`.
