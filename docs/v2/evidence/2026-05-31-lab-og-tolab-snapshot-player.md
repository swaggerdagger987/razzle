# Evidence — lab-og-tolab-snapshot-player (2026-05-31)

**Atom:** Snapshot exports preserve player in watermark (hallway epic 3/3)  
**Cycle:** 151

## Commands

```bash
PATH=$HOME/.local/bin:$PATH JWT_SECRET=test python3 -m pytest apps/api/tests/test_lab_og_tolab_watermark.py -q --noconftest
# 5 passed

npm run build --workspace=apps/web
# exit 0

# Snapshot-only URL (no player_id) — anchor embedded in payload
curl -s -o /tmp/og-gamelog-snap.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/gamelog?download=1&snapshot=<anchor+rows payload>"
# 200 53086
file /tmp/og-gamelog-snap.png
# PNG 1200x630
```

## Claim

`encodeOgSnapshot` embeds `{ anchor, rows }` for player-scoped Lab exports. OG route
`watermarkPlayerIdForOg` prefers snapshot anchor when `player_id` is omitted or still
the Ja'Marr default — terracotta `toLab()` band deep-links back to the exported player.

## Trust

T5 (screenshot hallway), T6 (`crossRoomLinkPresent` on OG export)
