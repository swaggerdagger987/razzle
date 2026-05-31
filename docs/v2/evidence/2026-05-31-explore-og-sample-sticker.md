# Evidence — explore-og-sample-sticker (2026-05-31)

## Slice

Explore OG `/og/explore` shows terracotta **SAMPLE · not live data** sticker when `force_demo=1` or screener returns empty (demo path). Matches Lab Launch-10 OG sticker pattern.

## Gate C — curl (dev server :3000)

| Route | HTTP | Bytes | Verdict |
|-------|------|-------|---------|
| `?universe=nfl&force_demo=1` | 200 | 59163 | PASS (≥40KB PNG) |
| `?universe=college&force_demo=1` | 200 | 63287 | PASS (≥40KB PNG) |

```bash
curl -s -o /tmp/og-explore-nfl-demo.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/explore?universe=nfl&sort=fantasy_points_ppr&dir=desc&force_demo=1'
file /tmp/og-explore-nfl-demo.png
```

## Build / tests

- `npm run build --workspace=apps/web` — exit 0
- `pytest apps/api/tests/test_smoke.py -q` — pass (local)

## Reality

PASS — demo path PNGs include SAMPLE sticker layout; sizes remain screenshot-worthy.
