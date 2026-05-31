# Evidence — Bureau Trade Finder OG demo row labels

**Date:** 2026-05-31  
**Slice:** `bureau-trade-finder-og-demo-label`  
**Verdict:** PASS (Gate C2)

## Change

- `apps/web/app/og/trade-finder/route.tsx` — list rows show `RB · 8,420 → WR · 8,310` dynasty labels; demo partner rows tagged `· sample`; subtitle `sample preview` trailing like other Bureau OG routes.

## Commands (executed)

```bash
cd apps/web && npm run build
# exit 0

JWT_SECRET=test python3 -m pytest apps/api/tests -q
# 51 passed, 5 skipped

curl -s -o /tmp/trade-finder-og.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/trade-finder?league=demo&user=demo&download=1'
# 200 60325 (verified post-rebase 2026-05-31)

file /tmp/trade-finder-og.png
# PNG 1200×630
```

Gate C2: PNG ≥ 40KB — **60325 bytes PASS**.
