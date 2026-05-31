# Evidence — lab-og-gamelog-from-panel-sticker

**Date:** 2026-05-31  
**Atom:** `lab-og-gamelog-from-panel-sticker` — Gamelog snapshot OG shows `FROM PANEL · Wk tape`  
**Trust:** T5, T6

## Build

- `JWT_SECRET=test python3 -m pytest apps/api/tests/test_og_from_panel_sticker.py -q` — 3 passed
- `npm run build --workspace=apps/web` — exit 0

## Gate C — gamelog snapshot OG PNG

```bash
SNAP=<base64url week rows>
curl -s -o /tmp/gamelog-snap.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/gamelog?download=1&player_id=00-0036900&snapshot='"$SNAP"
# 200 59323

file /tmp/gamelog-snap.png
# PNG 1200x630
```

## Code

- `apps/web/app/og/[panel]/route.tsx` — `PLAYER_SCOPED_SNAPSHOT_FROM_PANEL_SLUGS`, `showsFromPanelSticker`, gamelog label `FROM PANEL · Wk tape`.
- `apps/api/tests/test_og_from_panel_sticker.py` — contract guards.

## Verdict

PASS — Gamelog snapshot export ≥40KB PNG with player-scoped FROM PANEL sticker.
