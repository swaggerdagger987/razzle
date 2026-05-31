# Evidence — Lab OG prospects position filter

**Date:** 2026-05-31  
**Atom:** `lab-og-position-prospects`  
**Slice:** Pass `position` from ProspectsRenderer to `LabOgExportLink` (OG route already filters).

## Gate C — curl

| Route | HTTP | Bytes | Notes |
|-------|------|-------|-------|
| `/og/prospects?download=1&position=WR` | 200 | 49000 | WR-filtered demo rows |
| `/og/prospects?download=1` | 200 | 58084 | Full board |

Both responses are PNG 1200×630 (`file` verified).

## Build

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped

## Verdict

PASS — filtered prospects export URL matches in-panel position filter; PNG ≥40KB.
