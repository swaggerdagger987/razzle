# Evidence — lab-og-live-sticker-gamelog-dashboard

**Date:** 2026-05-31  
**Atom:** `lab-og-live-sticker-gamelog-efficiency`  
**Gate C:** OG PNG curl on local dev

## Acceptance

```text
npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/og-gamelog.png -w '%{http_code} %{size_download}\n' 'http://localhost:3000/og/gamelog?download=1'
# 200 60634

curl -s -o /tmp/og-dashboard.png -w '%{http_code} %{size_download}\n' 'http://localhost:3000/og/dashboard?download=1'
# 200 67113

pytest apps/api/tests/test_og_launch10_live_sticker.py -q
# 2 passed
```

**Verdict:** PASS
