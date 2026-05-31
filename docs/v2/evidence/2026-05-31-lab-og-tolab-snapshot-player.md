# Evidence — Lab OG snapshot player in watermark (2026-05-31)

**Atom:** `lab-og-tolab-snapshot-player`  
**Epic:** Lab L5 — OG hallway deep links (atom 3/3)

## Gate C

```bash
SNAP='eyJwaWQiOiAiMDAtMDAzNjkwMCIsICJyb3dzIjogW3sibiI6ICJKLiBDaGFzZSIsICJwIjogIldSIiwgInQiOiAiQ0lOIiwgInMiOiAyNC4xLCAic2wiOiAiUFBHIn1dfQ'
curl -s -o /tmp/og-gamelog-snap.png -w '%{http_code} %{size_download}\n' \
  "http://127.0.0.1:3000/og/gamelog?download=1&snapshot=${SNAP}"
# 200 53042

file /tmp/og-gamelog-snap.png
# PNG image data, 1200 x 630
```

Snapshot-only URL (no `player_id` query) — watermark uses embedded `pid` for toLab.

## Pytest

```bash
python3 -m pytest apps/api/tests/test_lab_og_tolab_watermark.py -q --noconftest
# 4 passed
```

## Build

```bash
npm run build --workspace=apps/web
# exit 0
```
