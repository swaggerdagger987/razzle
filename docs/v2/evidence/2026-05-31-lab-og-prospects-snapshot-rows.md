# Evidence — Lab L5 prospects OG snapshot rows

**Date:** 2026-05-31  
**Atom:** `lab-og-prospects-snapshot-rows`  
**Verdict:** PASS

## Results

- Snapshot curl: **200**, **57867** bytes, PNG 1200×630
- Live: **200**, **58084** bytes

## Change

`ProspectsRenderer` sorts top-6 by RPS and passes `position` + `snapshotRows` to `LabOgExportLink`.
