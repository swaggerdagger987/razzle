# Evidence — lab-weekly-empty-export

**Date:** 2026-05-31  
**Atom:** `lab-weekly-empty-export`  
**Epic:** Lab L5 — empty-board OG export sample cards (atom 3/3)

## Verification

| Check | Result |
|-------|--------|
| `pytest apps/api/tests/test_lab_og_export_link.py -q` | 5 passed |
| `npm run build --workspace=apps/web` | exit 0 |
| `curl /og/weekly?download=1&position=WR&snapshot=…` | `200 55675` PNG 1200×630 |

## Verdict

**PASS** — FACTORY-DOD Gate C. Empty weekly board exports sample hot-week rows via snapshot.
