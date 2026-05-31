# Evidence — lab-panel-share-bar-breakouts-buysell

**Date:** 2026-05-31  
**Atom:** Breakouts + Buy/Sell — LabPanelShareBar with formula snapshot rows  
**Trust:** T5, T6

## Commands

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_lab_panel_share_bar.py -q --noconftest
# 4 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/breakouts-og.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/breakouts?download=1&force_demo=1'
# 200 66253

curl -s -o /tmp/buysell-og.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/buysell?download=1&force_demo=1'
# 200 63936
```

## Change

- `BreakoutsRenderer` + `BuySellRenderer`: `LabOgExportLink` → `LabPanelShareBar` (copy/preview/export chunky buttons).
- Snapshot rows unchanged (`ogSnapshotRows` top-6 formula/RBS or buy+sell lanes).

## Verdict

**PASS** — Gate C satisfied (PNG ≥40KB demo on both routes).
