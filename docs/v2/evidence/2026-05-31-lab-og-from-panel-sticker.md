# Evidence — lab-og-from-panel-sticker

**Date:** 2026-05-31  
**Atom:** `lab-og-from-panel-sticker` — FROM PANEL sticker on Launch-10 OG snapshot exports  
**Trust:** T5, T6

## Build

- `JWT_SECRET=test .venv-v2/bin/python -m pytest apps/api/tests/test_og_from_panel_sticker.py -q` — 1 passed
- `npm run build --workspace=apps/web` — exit 0

## Gate C — snapshot OG PNG

```bash
SNAP=<base64url top-2 rows>
curl -s -o /tmp/rankings-snap.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/rankings?download=1&snapshot='"$SNAP"
# 200 55060

curl -s -o /tmp/weekly-snap.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/weekly?download=1&snapshot='"$SNAP"
# 200 56660

file /tmp/rankings-snap.png /tmp/weekly-snap.png
# PNG 1200x630 each
```

## Code

- `apps/web/app/og/[panel]/route.tsx` — blue `#5b7fff` Caveat sticker `FROM PANEL · your rows` when `isSnapshot && LAUNCH_10_OG_SLUGS`.
- Blurb still shows `· from your panel`; sticker gives screenshot-at-a-glance trust.

## Verdict

PASS — Launch-10 snapshot exports show FROM PANEL sticker and ≥40KB PNG with encoded rows.
