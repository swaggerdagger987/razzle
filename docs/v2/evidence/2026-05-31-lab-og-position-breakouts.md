# Evidence — Lab OG breakouts position filter

**Date:** 2026-05-31  
**Atom:** `lab-og-position-breakouts`  
**Slice:** Pass `position` from BreakoutsRenderer to `LabOgExportLink` (OG route already filters).

## Gate C — curl

| Route | HTTP | Bytes | Notes |
|-------|------|-------|-------|
| `/og/breakouts?download=1&position=WR` | 200 | 61718 | WR-filtered demo/live rows |
| `/og/breakouts?download=1` | 200 | 60649 | Full board |

Both responses are PNG 1200×630 (`file` verified).

## Build

- `npm run build --workspace=apps/web` — exit 0

## Verdict

PASS — filtered breakouts export URL matches in-panel position filter; PNG ≥40KB.
