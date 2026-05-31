# Evidence — Lab L5 LabOgExportLink (prospects, weekly, tradevalues)

**Date:** 2026-05-31  
**Atom:** `lab-og-export-link-prospects-weekly-tradevalues`

| Route | HTTP | Bytes |
|-------|------|-------|
| `/og/tradevalues?download=1` | 200 | 62488 |
| `/og/weekly?download=1` | 200 | 63819 |
| `/og/prospects?download=1` | 200 | 58084 |

**Build:** `npm run build --workspace=apps/web` exit 0  
**API:** `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 52 passed (2 snapshot errors on dynasty_top_30 — pre-existing data drift)

**Verdict:** PASS — PNGs ≥40KB; three renderers use `LabOgExportLink`.
