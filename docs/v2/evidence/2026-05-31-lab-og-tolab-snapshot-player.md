# Evidence — lab-og-tolab-snapshot-player

**Date:** 2026-05-31  
**Atom:** `lab-og-tolab-snapshot-player` — snapshot exports preserve player in OG toLab watermark.

## Commands

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_lab_og_tolab_watermark.py -q --noconftest
# 5 passed

npm run build --workspace=apps/web
# exit 0
```

## Change

- `encodeOgSnapshot` embeds compact `i` (player gsis_id) on the first row when exporting from Lab.
- `decodeOgSnapshot` returns `playerId` so `/og/[panel]` watermark uses `effectivePlayerId` even if `player_id` is stripped from the share URL.

## Verdict

PASS — T6 hallway on snapshot-only OG links; pytest + web build green.
