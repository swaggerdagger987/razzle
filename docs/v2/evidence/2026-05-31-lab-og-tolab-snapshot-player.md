# Evidence — lab-og-tolab-snapshot-player

**Date:** 2026-05-31  
**Atom:** `lab-og-tolab-snapshot-player` — FROM PANEL snapshot exports keep player in OG toLab watermark.

## Commands

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_lab_og_tolab_watermark.py -q --noconftest
# 4 passed

npm run build --workspace=apps/web
# exit 0

SNAP=<base64url snapshot rows>
curl -s -o /tmp/og-snap-gamelog.png -w '%{http_code} %{size_download}' \
  "http://127.0.0.1:3000/og/gamelog?download=1&player_id=00-0036900&snapshot=$SNAP"
# 200 53752
file /tmp/og-snap-gamelog.png
# PNG 1200x630
```

## Change

`labOgWatermarkLink` treats `isSnapshot && playerScoped` like default-player panels so
`player_id` on snapshot export URLs survives in the typed `toLab()` hallway link.

## Verdict

PASS — FACTORY-DOD Gate C (PNG ≥ 40KB).
