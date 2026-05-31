# Evidence — Lab weekly + gamelog GTM share bar

**Date:** 2026-05-31  
**Atom:** `lab-panel-share-bar-weekly-gamelog`  
**Epic:** Lab L5 — GTM panel share bar parity (3/4)

## Commands

```bash
JWT_SECRET=test-secret python3 -m pytest apps/api/tests/test_lab_panel_share_bar.py -q --noconftest
# 6 passed

curl -s -o /tmp/weekly-og.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/weekly?force_demo=1&download=1&position=WR"
# 200 65110

curl -s -o /tmp/gamelog-og.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/gamelog?force_demo=1&download=1&player_id=00-0036900"
# 200 62741
```

## Verdict

**PASS** — Weekly + Gamelog use `LabPanelShareBar` (copy/preview/export + player_id on gamelog). Both OG PNGs ≥40KB.
