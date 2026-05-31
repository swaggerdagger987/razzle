# Evidence — lab-panel-share-bar-weekly-gamelog

**Date:** 2026-05-31  
**Atom:** Weekly heatmap + gamelog LabPanelShareBar  
**Verdict:** PASS

## Gate C

```bash
curl -s -o /tmp/weekly-og.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/weekly?download=1&force_demo=1'
# 200 71581
```

## Product

- `WeeklyHeatmapRenderer` + `GamelogRenderer` footers: copy panel link, preview card, export card (matches rankings GTM row).

## Tests

- `python3 -m pytest apps/api/tests/test_lab_panel_share_bar.py -q` — 6 passed
- `npm run build --workspace=apps/web` — exit 0
