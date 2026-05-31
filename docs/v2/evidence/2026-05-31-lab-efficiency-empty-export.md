# Evidence — lab-efficiency-empty-export

**Date:** 2026-05-31  
**Atom:** `lab-efficiency-empty-export`  
**Room/Layer:** Lab L5

## Change

`EfficiencyRenderer` shows `LabOgExportLink` with `export sample card` label in the empty-board footer so managers can screenshot a demo efficiency card when position filter returns zero rows.

## Verification (Reality Checker)

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test pytest apps/api/tests/test_lab_og_export_link.py -q` — 4 passed
- `curl` efficiency OG `position=RB` — HTTP 200, PNG 54674 bytes (≥40KB)
- `file /tmp/efficiency-og-empty2.png` — PNG image data 1200×630
