# Evidence — lab-rankings-empty-export

**Date:** 2026-05-31  
**Atom:** `lab-rankings-empty-export`  
**Cycle:** 143 (workday cycle 1)

## Change

`DynastyRankingsRenderer` shows `LabOgExportLink` with `label="export sample card"` when formula sort or tier list returns zero rows.

## Verification

| Check | Result |
|-------|--------|
| `npm run build --workspace=apps/web` | exit 0 |
| `pytest apps/api/tests/test_og_launch10_live_sticker.py -q` | 2 passed |
| `curl .../og/rankings?download=1&position=ZZ` | `200 40611` PNG 1200×630 |

## Verdict

**PASS** — FACTORY-DOD Gate C.
