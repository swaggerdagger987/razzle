# Evidence — lab-og-tolab-snapshot-weekly-player

**Date:** 2026-05-31  
**Cycle:** 157  
**Atom:** Weekly heatmap export passes hot-row player_id into OG URL

## Acceptance

```bash
PATH=$HOME/.local/bin:$PATH JWT_SECRET=test python3 -m pytest apps/api/tests/test_lab_og_tolab_watermark.py -q --noconftest
# 8 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/og-weekly.png -w '%{http_code} %{size_download}' \
  'http://127.0.0.1:3000/og/weekly?download=1&position=WR&player_id=00-0036900'
# 200 65110
file /tmp/og-weekly.png
# PNG image data, 1200 x 630
```

## Verdict

**PASS** — Gate C satisfied (PNG ≥40KB). WeeklyHeatmapRenderer passes `hotPlayer.p.player_id` into LabOgExportLink so snapshot pid + URL player_id reach OG watermark toLab hallway.
