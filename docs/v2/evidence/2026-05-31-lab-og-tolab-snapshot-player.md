# Evidence — lab-og-tolab-snapshot-player

**Date:** 2026-05-31  
**Atom:** `lab-og-tolab-snapshot-player` — Snapshot exports preserve player in watermark  
**Trust:** T5, T6

## Build

- `python3 -m pytest apps/api/tests/test_lab_og_tolab_snapshot_player.py apps/api/tests/test_lab_og_tolab_watermark.py -q --noconftest` — 5 passed
- `npm run build --workspace=apps/web` — exit 0

## Gate C

```bash
curl -s -o /tmp/rankings-snap.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/rankings?download=1&force_demo=1&player_id=00-0036900'
# 200 ≥40KB with demo/snapshot path
```

## Code

- `labOgWatermarkLink` — `snapshotPlayer` includes non-default `player_id` on snapshot exports; appends `from=panel` for hallway context.

## Verdict

PASS — snapshot OG terracotta band deep-links back to Lab with player + from-panel query.
