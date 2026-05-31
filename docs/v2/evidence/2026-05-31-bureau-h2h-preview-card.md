# Evidence — bureau-h2h-preview-card

**Date:** 2026-05-31  
**Atom:** `bureau-h2h-preview-card`  
**Verdict:** PASS

## Commands

```bash
npm run build --workspace=apps/web
JWT_SECRET=test python3 -m pytest apps/api/tests/test_bureau_h2h_share_bar.py -q
curl -s -o /tmp/h2h-preview.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/head-to-head?league=demo&user=u1&opponent=u2'
```

## Results

| Check | Result |
|-------|--------|
| Web build | exit 0 |
| pytest | 2 passed |
| Preview URL (no download=1) | 200 77104 PNG 1200×630 |

## Change

`BureauH2HShareBar` adds preview card link mirroring BriefingShareBar.
