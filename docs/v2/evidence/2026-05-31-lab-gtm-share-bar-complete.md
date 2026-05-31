# Evidence — Lab L5 GTM share bar complete (2026-05-31)

**Atom:** `lab-gtm-share-bar-complete`  
**Slice:** `LabPanelShareBar` on rankings/breakouts/buysell/weekly/gamelog; `LabOgExportLink` delegates for Launch-10 remainder.

## Commands

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_lab_panel_share_bar.py -q --noconftest
npm run build --workspace=apps/web
curl -s -o /tmp/eff-og.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/efficiency?download=1&force_demo=1&position=WR'
curl -s -o /tmp/tv-og.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/tradevalues?download=1&force_demo=1&position=WR'
curl -s -o /tmp/dash-og.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/dashboard?download=1&force_demo=1'
```

## Results

- pytest: 8 passed
- web build: exit 0
- efficiency: 200 59375B
- tradevalues: 200 61928B
- dashboard: 200 66547B

## Verdict

PASS — All Launch-10 Staff Picks panels have copy/preview/export share bar; OG PNGs ≥40KB on demo path.
