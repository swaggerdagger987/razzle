# Evidence — league-h2h-og-live-sample-stickers

**Date:** 2026-05-31  
**Route:** `/og/head-to-head?download=1` (demo), `/og/head-to-head?league=test&user=u1&opponent=u2&download=1` (live attempt)  
**Verdict:** PASS (Gate C)

## Commands

```bash
npm run build --workspace=apps/web
curl -s -o /tmp/og-h2h-demo.png -w '%{http_code} %{size_download}\n' 'http://127.0.0.1:3000/og/head-to-head?download=1'
curl -s -o /tmp/og-h2h-live.png -w '%{http_code} %{size_download}\n' 'http://127.0.0.1:3000/og/head-to-head?league=test&user=u1&opponent=u2&download=1'
```

## Results

| Check | Result |
|-------|--------|
| web build | exit 0 |
| curl demo H2H OG | `200 76808` |
| curl live params | `200 80606` |
| PNG | 1200×630, ≥40KB |

## Notes

- Teal `#2ec4b6` LIVE sticker when Sleeper API returns you/them rows.
- Terracotta `#d97757` SAMPLE sticker on demo fallback (with/without league params).
- League H2H OG parity epic atom 1/3.
