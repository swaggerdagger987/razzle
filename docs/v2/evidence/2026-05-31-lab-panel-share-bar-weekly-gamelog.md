# Evidence — Lab weekly + gamelog GTM share bar (2026-05-31)

## Slice

`lab-panel-share-bar-weekly-gamelog` — atom 3/4 of Lab L5 GTM panel share bar epic.

## Changes

- `WeeklyHeatmapRenderer`: `LabPanelShareBar` with `copy weekly link`, position + snapshot rows (live + sample).
- `GamelogRenderer`: player-scoped `LabPanelShareBar` on search-empty, empty-weeks, and peak-week footers.

## Verification

```text
pytest apps/api/tests/test_lab_panel_share_bar.py — 6 passed
npm run build --workspace=apps/web — exit 0
curl weekly force_demo WR — 200 65110 bytes PNG
curl gamelog force_demo — 200 62741 bytes PNG
```

## Trust

T5 (export matches visible rows via snapshot), T6 (GTM copy/preview/export bar parity with Explore/Bureau).
