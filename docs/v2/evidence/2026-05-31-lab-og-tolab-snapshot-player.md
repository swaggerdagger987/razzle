# Evidence — Lab OG snapshot player in watermark

**Date:** 2026-05-31  
**Slice:** `lab-og-tolab-snapshot-player`  
**Verdict:** PASS

```bash
pytest apps/api/tests/test_lab_og_tolab_snapshot_player.py apps/api/tests/test_lab_og_tolab_watermark.py -q
# 5 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/og-gamelog-snap.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/gamelog?download=1&player_id=00-0036900&snapshot=W3sibiI6IldrIDEyIiwicCI6IldSIiwidCI6IkNJTiIsInMiOjMxLjQsInNsIjoiUFBSIn1d'
# 200 ≥40KB — snapshot + default player watermark
```
