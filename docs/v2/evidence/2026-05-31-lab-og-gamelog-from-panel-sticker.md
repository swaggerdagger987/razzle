# Evidence — lab-og-gamelog-from-panel-sticker

**Date:** 2026-05-31  
**Atom:** `lab-og-gamelog-from-panel-sticker` — FROM PANEL sticker on gamelog + dynasty-comps snapshot OG exports  
**Trust:** T5, T6

## Build

- `JWT_SECRET=test python3 -m pytest apps/api/tests/test_og_gamelog_from_panel_sticker.py apps/api/tests/test_og_from_panel_sticker.py -q --noconftest` — 4 passed
- `npm run build --workspace=apps/web` — exit 0

## Gate C — gamelog snapshot OG PNG

```bash
curl -s -o /tmp/og-gamelog-snap.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/gamelog?download=1&player_id=00-0036900&snapshot=eyJuIjoiV2sgMTIiLCJwIjoiV1IiLCJ0IjoiQ0lOIiwicyI6MjguNCwic2wiOiJQUFIifSx7Im4iOiJXayA4IiwicCI6IldSIiwidCI6IkNJTiIsInMiOjIyLjEsInNsIjoiUFBSIn1d'
# 200 59323

file /tmp/og-gamelog-snap.png
# PNG 1200x630
```

## Code

- `apps/web/app/og/[panel]/route.tsx` — `PLAYER_SCOPED_FROM_PANEL_STICKER_SLUGS` (`gamelog`, `dynasty-comps`) extends blue `#5b7fff` `FROM PANEL · your rows` sticker on snapshot exports.

## Verdict

PASS — Pro gamelog snapshot export ≥40KB PNG with FROM PANEL trust sticker.
