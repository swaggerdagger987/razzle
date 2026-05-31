# Evidence — bureau-h2h-copy-og-preview-link

**Date:** 2026-05-31  
**Atom:** `bureau-h2h-copy-og-preview-link`  
**Verdict:** PASS

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests/test_bureau_h2h_share_bar.py -q   # 3 passed
curl -s -o /tmp/h2h-copy-og.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/head-to-head?league=demo&user=u1&opponent=u2'
file /tmp/h2h-copy-og.png
```

## Results

| Check | Result |
|-------|--------|
| Web build | exit 0 |
| pytest share bar contract | 3 passed |
| OG preview URL | `200 77104` PNG 1200×630 |
| Copy link | `previewPath` → `/og/head-to-head?…` (mirrors BriefingShareBar) |

## Change

`BureauH2HShareBar` **copy card link** copies the OG preview URL instead of the in-app league rivalry path.
