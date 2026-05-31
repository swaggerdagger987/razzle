# Evidence — lab-og-tolab-snapshot-player

**Date:** 2026-05-31  
**Atom:** `lab-og-tolab-snapshot-player` — snapshot OG payload embeds `player_id` so toLab watermark survives snapshot-only URLs.

## Commands

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_lab_og_tolab_watermark.py -q --noconftest
# 4 passed

npm run build --workspace=apps/web
# exit 0

SNAP='eyJyIjpbeyJuIjoiV2sgMSIsInAiOiJXUiIsInQiOiJDRU4iLCJzIjoxOC41LCJzbCI6IlBQUiJ9XSwicCI6IjAwLTAwMzY5MDAifQ'
curl -s -o /tmp/og-gamelog-snap.png -w '%{http_code} %{size_download}' \
  "http://127.0.0.1:3000/og/gamelog?download=1&snapshot=${SNAP}"
# 200 52827 (no player_id query param — player from snapshot `p` field)

curl -s -o /tmp/og-gamelog-live.png -w '%{http_code} %{size_download}' \
  'http://127.0.0.1:3000/og/gamelog?download=1'
# 200 62232
```

## Change

`encodeOgSnapshot` wraps rows as `{ r, p }` when `playerId` is set; `/og/[panel]` decodes `snapshotPlayerId` for `labOgWatermarkLink`. Legacy array-only snapshots unchanged.

## Verdict

PASS — FACTORY-DOD Gate C (PNG ≥ 40KB).
