# Evidence — Lab OG snapshot player in toLab watermark (2026-05-31)

**Atom:** `lab-og-tolab-snapshot-player` — snapshot payload carries `pid`; watermark uses it when URL omits `player_id`.

## Commands

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_lab_og_tolab_watermark.py -q --noconftest
# 4 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/og-snap-tolab.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/gamelog?download=1&player_id=00-0036900'
# 200 62232
file /tmp/og-snap-tolab.png  # PNG 1200x630
```

## Verdict

PASS — `encodeOgSnapshot` embeds `pid`; `decodeOgSnapshot` returns `playerId` for `labOgWatermarkLink` on FROM PANEL exports.

## Trust

T5 (export fidelity), T6 (hallway toLab on screenshot watermark).
