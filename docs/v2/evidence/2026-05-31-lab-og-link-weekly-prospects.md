# Evidence — Lab L5 LabOgExportLink (weekly, prospects)

**Date:** 2026-05-31  
**Atom:** `lab-og-link-weekly-prospects`

| Route | HTTP | Bytes |
|-------|------|-------|
| `/og/weekly?download=1` | 200 | 63819 |
| `/og/prospects?download=1` | 200 | 58084 |

**Build:** `npm run build --workspace=apps/web` exit 0  
**API:** `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped

**Verdict:** PASS — PNGs ≥40KB with demo rows; footers use `LabOgExportLink`.
