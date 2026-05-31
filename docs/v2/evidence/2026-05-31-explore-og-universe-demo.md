# Evidence — explore-og-universe-demo (2026-05-31)

## Slice

Explore OG `/og/explore` shows universe-specific demo rows when `force_demo=1` or screener returns empty — no loading-copy-only card.

## Gate C — curl (dev server :3000)

| Route | HTTP | Bytes | Verdict |
|-------|------|-------|---------|
| `?universe=nfl&force_demo=1` | 200 | 64609 | PASS (≥40KB PNG) |
| `?universe=college&force_demo=1` | 200 | 65226 | PASS (≥40KB PNG) |

```bash
curl -s -o /tmp/og-explore-nfl-demo.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/explore?universe=nfl&sort=fantasy_points_ppr&dir=desc&force_demo=1'
file /tmp/og-explore-nfl-demo.png
```

## Build / tests

- `npm run build --workspace=apps/web` — exit 0
- `pytest apps/api/tests/test_smoke.py -q` — 3 passed

## Reality

PASS — demo path PNGs show ranked rows; subtitle includes `sample preview`.
