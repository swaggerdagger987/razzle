# Evidence — explore-og-preview-watermark

**Date:** 2026-05-31  
**Atom:** `explore-og-preview-watermark`  
**Verdict:** PASS

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q   # 51 passed, 5 skipped
curl -s -o /tmp/og-preview.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/explore?universe=nfl&sort=fantasy_points_ppr&dir=desc&pos=RB'
```

## Results

| Check | Result |
|-------|--------|
| Web build | exit 0 |
| pytest | 51 passed, 5 skipped |
| Preview URL (no `download=1`) | `200 33148` PNG 1200×630 |
| Toolbar | `preview card` opens `/og/explore?…` without download param |

## Change

`ExploreShareButton` adds **preview card** link using `previewParams` (no `download=1`) so OS screenshots and embeds hit the always-on watermark band.
