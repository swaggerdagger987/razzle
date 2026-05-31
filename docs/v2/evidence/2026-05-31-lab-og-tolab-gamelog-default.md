# Evidence — Lab OG toLab gamelog default player (cycle 147)

**Slice:** `lab-og-tolab-gamelog-default`  
**Date:** 2026-05-31

## Commands

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_lab_og_tolab_watermark.py -q --noconftest
# 4 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/og-gamelog.png -w "%{http_code} %{size_download}\n" \
  "http://127.0.0.1:3000/og/gamelog?download=1"
# 200 62232
file /tmp/og-gamelog.png
# PNG 1200x630
```

## Claim

Gamelog OG watermark `toLab()` deep link always carries the default Ja'Marr Chase
`player` query when no explicit `player_id` is passed — player-scoped tape exports
click back into Lab with the same weeks loaded.
