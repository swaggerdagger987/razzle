# Evidence — lab-og-live-sticker-efficiency-aging-buysell

**Date:** 2026-05-31  
**Atom:** `lab-og-live-sticker-efficiency-aging-buysell`  
**Gate C:** OG PNG curl on local dev

## Acceptance

```text
npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/og-efficiency.png -w '%{http_code} %{size_download}\n' 'http://localhost:3000/og/efficiency?download=1'
# 200 65762

curl -s -o /tmp/og-aging.png -w '%{http_code} %{size_download}\n' 'http://localhost:3000/og/aging?download=1'
# 200 65088

curl -s -o /tmp/og-buysell.png -w '%{http_code} %{size_download}\n' 'http://localhost:3000/og/buysell?download=1'
# 200 65247
```

All PNG ≥40KB. Sticker labels: PPO board / peak curves / market movers.

**Verdict:** PASS
