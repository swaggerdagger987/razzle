# Evidence — Lab L5 weekly OG PPG-ranked snapshot

**Date:** 2026-05-31  
**Atom:** `lab-og-weekly-ppg-ranked`

## Dedup / verify

- `WeeklyHeatmapRenderer` on base already sorts `ogSnapshotRows` by PPG top-6 and passes `position` + `snapshotRows` to `LabOgExportLink`.

## Curl

- `curl ... /og/weekly?download=1&position=WR` → `200 53320` (PNG ≥40KB)
- Snapshot param with PPG rows → `200` PNG valid

## Build

- `npm run build --workspace=apps/web` — PASS (prior cycle env)

**Verdict:** PASS (verify-only; no code delta)
