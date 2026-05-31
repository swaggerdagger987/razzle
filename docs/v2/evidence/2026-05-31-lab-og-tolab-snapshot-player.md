# Evidence — lab-og-tolab-snapshot-player

**Date:** 2026-05-31  
**Cycle:** 153  
**Verdict:** PASS (Gate C)

## Commands

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_lab_og_tolab_snapshot_player.py apps/api/tests/test_lab_og_tolab_watermark.py -q
# 6 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/og-rankings.png -w "rankings %{http_code} %{size_download}\n" \
  "http://localhost:3000/og/rankings?download=1"
# rankings 200 66806

curl -s -o /tmp/og-gamelog.png -w "gamelog %{http_code} %{size_download}\n" \
  "http://localhost:3000/og/gamelog?download=1&player_id=00-0036900"
# gamelog 200 62741
```

## Gate C

| Route | HTTP | Bytes | PNG |
|-------|------|-------|-----|
| `/og/rankings?download=1` | 200 | 66806 | yes |
| `/og/gamelog?download=1&player_id=00-0036900` | 200 | 62741 | yes |

## Change summary

- `encodeOgSnapshot` v1 embeds `pi`/`pn` for player-scoped panels.
- `decodeOgSnapshot` returns `OgSnapshotPayload` with player hallway context.
- OG watermark `toLab` uses resolved player name (snapshot or `name` query param).
