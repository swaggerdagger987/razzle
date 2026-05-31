# Evidence — lab-og-from-panel-breakouts-efficiency

**Date:** 2026-05-31  
**Atom:** `lab-og-from-panel-breakouts-efficiency`  
**Trust:** T5, T6

## Build

- `JWT_SECRET=test python3 -m pytest apps/api/tests/test_og_from_panel_sticker.py -q --noconftest` — 7 passed
- `npm run build --workspace=apps/web` — exit 0

## Gate C — FROM PANEL snapshot PNG

```bash
curl -s -o /tmp/og-breakouts.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/breakouts?download=1&snapshot=<6-row RBS board>'
# 200 58268

curl -s -o /tmp/og-efficiency.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/efficiency?download=1&snapshot=<6-row PPO board>'
# 200 58496
```

## Code

- `apps/api/tests/test_og_from_panel_sticker.py` — breakouts + efficiency in `SNAPSHOT_FROM_PANEL_SLUGS`; RBS + PPO extract guards.

## Verdict

PASS — breakouts/efficiency snapshot exports ≥40KB PNG with FROM PANEL contract; Lab OG parity epic atom 1/4.
