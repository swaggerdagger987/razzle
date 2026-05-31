# Evidence — bureau-mc-og-live-sample-sticker

**Date:** 2026-05-31  
**Atom:** `bureau-mc-og-live-sample-sticker`  
**Epic:** League L5 — Bureau H2H export trust stickers (atom 2/3)

## Commands

```bash
npm run build --workspace=apps/web

curl -s -o /tmp/mc-demo.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/monte-carlo?download=1'
# 200 58593

curl -s -o /tmp/mc-snap.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/monte-carlo?download=1&snapshot=eyJyIjpbeyJpZCI6MSwibSI6IkR5bmFzdHkgRHVrZXMiLCJjcCI6MjgsInBwIjo5MSwicnAiOjk0fV19'
# 200 51970

file /tmp/mc-demo.png /tmp/mc-snap.png
# PNG 1200×630 both paths
```

## Verdict

PASS — terracotta SAMPLE, teal LIVE, purple EXPORTED stickers on `/og/monte-carlo` match H2H / Launch-10 OG trust pattern (T2 honest labeling).

## Trust

T2, T5, T6
