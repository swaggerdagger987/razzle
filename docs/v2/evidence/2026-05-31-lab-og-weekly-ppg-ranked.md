# Evidence — lab-og-weekly-ppg-ranked

**Date:** 2026-05-31  
**Atom:** `lab-og-weekly-ppg-ranked`  
**Verdict:** PASS (Reality)

## Acceptance

| Check | Result |
|-------|--------|
| `npm run build --workspace=apps/web` | exit 0 |
| `pytest` (51 core tests) | 51 passed |

## Change

- `WeeklyHeatmapRenderer.tsx` — OG snapshot rows filter to active position tab before PPG sort (top 6).

## Gate C

Lab OG slice — export link passes `position` + `snapshot` query params (existing `LabOgExportLink`). Build PASS; curl deferred to CI preview (no local server in VM).
