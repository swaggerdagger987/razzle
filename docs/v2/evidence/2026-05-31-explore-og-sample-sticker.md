# Evidence — explore-og-sample-sticker (2026-05-31)

**Atom:** Explore OG — terracotta SAMPLE sticker on demo path  
**Route:** `/og/explore?universe=nfl&force_demo=1`

## Gate C

| Check | Result |
|-------|--------|
| HTTP | 200 |
| PNG size | 64891 bytes (≥40KB) |
| `file` | PNG 1200×630 |

## Build

- `npm run build --workspace=apps/web` — exit 0
- `pytest apps/api/tests/test_smoke.py` — 3 passed

## Verdict

**PASS** — demo path shows rotated terracotta Caveat sticker `SAMPLE · not live screener`.
