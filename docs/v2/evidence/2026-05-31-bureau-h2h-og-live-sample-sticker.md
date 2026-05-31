# Evidence — bureau-h2h-og-live-sample-sticker

**Date:** 2026-05-31  
**Atom:** `bureau-h2h-og-live-sample-sticker`  
**Epic:** League L5 — Bureau H2H export trust stickers (atom 1/3)

## Commands

```bash
npm run build --workspace=apps/web
JWT_SECRET=test PATH="$HOME/.local/bin:$PATH" pytest apps/api/tests/test_bureau_h2h_og_snapshot_codec.py -q
# 4 passed

curl -s -o /tmp/h2h-demo.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/head-to-head?download=1'
# 200 78044

curl -s -o /tmp/h2h-snap.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/head-to-head?download=1&snapshot=<canonical y/m/pc>'
# 200 81070

file /tmp/h2h-demo.png /tmp/h2h-snap.png
# PNG 1200×630 both paths
```

## Verdict

PASS — terracotta SAMPLE, teal LIVE, purple EXPORTED stickers on `/og/head-to-head` match Launch-10 OG trust pattern (T2 honest labeling).

## Trust

T2, T5, T6
