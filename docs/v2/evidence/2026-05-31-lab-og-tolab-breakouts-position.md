# Evidence — Lab OG breakouts WR position in toLab watermark

**Slice:** `lab-og-tolab-breakouts-position`  
**Date:** 2026-05-31

## Commands

```bash
pytest apps/api/tests/test_lab_og_tolab_watermark.py -q
# 9 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/og-breakouts.png -w "%{http_code} %{size_download}\n" \
  "http://127.0.0.1:3000/og/breakouts?download=1"
# 200 66253
file /tmp/og-breakouts.png
# PNG 1200x630
```

## Claim

Breakouts OG cards default API fetch and toLab watermark to `position=WR`, matching
demo row scope and Hawkeye waiver-board screenshots (closes position-defaults epic 3/3).
