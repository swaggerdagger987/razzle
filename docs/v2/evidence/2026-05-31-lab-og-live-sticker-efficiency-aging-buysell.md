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

**Re-verify (post-rebase 2026-05-31):** efficiency 200 65762B; aging 200 65088B; buysell 200 65247B; web build exit 0.

**Verdict:** PASS
