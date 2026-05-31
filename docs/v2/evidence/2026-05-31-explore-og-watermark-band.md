# Evidence — explore-og-watermark-band

**Date:** 2026-05-31  
**Atom:** `explore-og-watermark-band`  
**Verdict:** PASS

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
curl -s -o /tmp/og-explore.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3001/og/explore?download=1&universe=nfl&sort=fantasy_points_ppr&dir=desc&pos=RB'
curl -s -o /tmp/og-preview.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3001/og/explore?universe=nfl&sort=fantasy_points_ppr&dir=desc'
```

## Results

| Check | Result |
|-------|--------|
| Web build | exit 0 |
| OG download | `200 34471` PNG 1200×630 |
| OG preview (no download) | `200 32195` — watermark band always rendered |
| Band | Terracotta `#d97757` strip with `made with 🐯 razzle.lol` |

## Change

`/og/explore` always shows bottom watermark band (not gated on `download=1`) so OS screenshots carry Razzle branding.
