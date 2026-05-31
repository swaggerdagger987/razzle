# Evidence — lab-og-tolab-snapshot-player

**Date:** 2026-05-31  
**Atom:** `lab-og-tolab-snapshot-player` — snapshot OG exports keep `player_id` in watermark `toLab` link.

## Commands

```bash
PATH=$HOME/.local/bin:$PATH JWT_SECRET=test python3 -m pytest apps/api/tests/test_lab_og_tolab_watermark.py -q --noconftest
# 4 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/og-gamelog-snap.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/gamelog?download=1&player_id=00-0036900&snapshot=eyJuIjoiSmEnTWFyciBDaGFzZSIsInAiOiJXUiIsInQiOiJDTUYiLCJzIjo0Mi4xLCJzbCI6IkZQVFMifV0'
# 200 61435
file /tmp/og-gamelog-snap.png
# PNG 1200x630
```

## Change

`labOgWatermarkLink` accepts `fromSnapshot`; `snapshotPreservesPlayer` keeps gamelog/dynasty-comps
`toLab()` deep links when export uses encoded panel rows.

## Verdict

PASS — FACTORY-DOD Gate C (PNG ≥ 40KB).
