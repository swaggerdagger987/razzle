# Evidence — Bureau Trade Finder OG demo row labels

**Date:** 2026-05-31  
**Slice:** `bureau-trade-finder-og-demo-label`  
**Verdict:** PASS (Gate C2)

## Change

- `apps/web/app/og/trade-finder/route.tsx` — list rows show dynasty value labels; demo partners tagged `· sample`.

## Commands (executed)

```bash
cd apps/web && npm run build
curl -s -o /tmp/trade-finder-og.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/trade-finder?league=demo&user=demo&download=1'
# 200 60325
```

Gate C2: **60325 bytes PASS**.
