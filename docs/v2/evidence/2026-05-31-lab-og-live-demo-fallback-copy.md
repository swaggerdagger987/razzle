# Evidence — Lab L5 OG SAMPLE demo sticker (2026-05-31)

**Atom:** `lab-og-live-demo-fallback-copy`  
**Route:** `apps/web/app/og/[panel]/route.tsx`  
**Content commit:** `c892dd56`

## Claim

Launch-10 OG cards show a terracotta **SAMPLE · demo rows** sticker when demo fallback rows render, contrasting the teal **LIVE** sticker.

## Gate C

| Route | HTTP | Bytes | PNG |
|-------|------|-------|-----|
| `/og/rankings?position=WR&download=1` | 200 | 58065 | 1200×630 |
| `/og/buysell?position=WR&download=1` | 200 | 51950 | 1200×630 |

## Commands

```bash
npm run build --workspace=apps/web
JWT_SECRET=test-secret python3 -m pytest apps/api/tests -q  # 55 passed, 5 skipped
curl -s -o /tmp/og-rankings-demo.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/rankings?position=WR&download=1'
curl -s -o /tmp/og-buysell-demo.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/buysell?position=WR&download=1'
```

## Verdict

**PASS** — demo OG PNGs ≥40KB with SAMPLE sticker path active on Launch-10 slugs.
