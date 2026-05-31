# Evidence — explore-og-universe-demo (2026-05-31)

## Slice

Explore OG `/og/explore` shows universe-specific demo rows when `force_demo=1` or screener returns empty — no loading-copy-only card.

## Gate C — curl (dev server :3000)

| Route | HTTP | Bytes | Verdict |
|-------|------|-------|---------|
| `?universe=nfl&force_demo=1` | 200 | 64609 | PASS (≥40KB PNG) |
| `?universe=college&force_demo=1` | 200 | 65226 | PASS (≥40KB PNG) |

## Build / tests

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test .venv-v2/bin/python -m pytest apps/api/tests/test_smoke.py -q` — 3 passed

## Reality

PASS — demo path PNGs show ranked rows; subtitle includes `sample preview`.
