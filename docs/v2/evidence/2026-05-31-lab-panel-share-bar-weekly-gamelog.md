# Evidence — Lab weekly + gamelog GTM share bar

**Date:** 2026-05-31  
**Atom:** `lab-panel-share-bar-weekly-gamelog`  
**Epic:** Lab L5 — GTM panel share bar parity (atom 3/4)

## Commands

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_lab_panel_share_bar.py -q --noconftest
npm run build --workspace=apps/web
curl -s -o /tmp/og-weekly.png -w "%{http_code} %{size_download}\n" \
  "http://127.0.0.1:3000/og/weekly?download=1&force_demo=1"
curl -s -o /tmp/og-gamelog.png -w "%{http_code} %{size_download}\n" \
  "http://127.0.0.1:3000/og/gamelog?download=1&force_demo=1"
```

## Results

| Check | Output |
|-------|--------|
| pytest | 6 passed |
| web build | exit 0 |
| curl weekly | 200 71581 |
| curl gamelog | 200 62741 |

## Verdict

**PASS** — Weekly heatmap + gamelog panels use `LabPanelShareBar` (copy/preview/export) instead of export-only links.
