# Evidence — lab-aging-empty-export

**Date:** 2026-05-31  
**Atom:** `lab-aging-empty-export`  
**Cycle:** 151

## Change

`AgingCurvesRenderer` shows `LabOgExportLink` with `AGING_SAMPLE_OG_ROWS` when position curve data is empty.

## Verification

| Check | Result |
|-------|--------|
| `pytest apps/api/tests/test_lab_og_export_link.py -q --noconftest` | 6 passed |
| `npm run build --workspace=apps/web` | exit 0 |
| `curl /og/aging?download=1&position=RB&snapshot=…` | `200 55270` PNG 1200×630 |

## Verdict

**PASS** — FACTORY-DOD Gate C.
