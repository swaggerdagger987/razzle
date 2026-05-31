# Evidence — Explore OG LIVE/SAMPLE stickers (2026-05-31)

**Atom:** `explore-og-live-sample-stickers`  
**Route:** `apps/web/app/og/explore/route.tsx`  
**Content commit:** `c6ac2c47`

## Claim

Dynasty screener OG shows teal **LIVE · screener rows** when API returns players, terracotta **SAMPLE · demo screener** with six demo rows when empty or `force_demo=1`.

## Gate C

| Route | HTTP | Bytes | PNG |
|-------|------|-------|-----|
| `/og/explore?force_demo=1&download=1` | 200 | 60920 | 1200×630 |

## Commands

```bash
npm run build --workspace=apps/web
curl -s -o /tmp/og-explore-demo.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/explore?force_demo=1&download=1'
```

## Verdict

**PASS** — demo OG PNG ≥40KB; no loading-only empty card.
