# Evidence — explore-og-live-sticker (2026-05-31)

## Slice

Explore OG `/og/explore` shows terracotta SAMPLE when demo/empty and teal **LIVE · nflverse rows** when screener returns data.

## Gate C — curl (dev :3000 + API :8000, terminal.db synced)

| Route | HTTP | Bytes | Verdict |
|-------|------|-------|---------|
| `force_demo=1` | 200 | 64151 | PASS (SAMPLE path ≥40KB) |
| live nfl FPTS sort | 200 | 59742 | PASS (LIVE path ≥40KB) |

## Build / tests

- `npm run build --workspace=apps/web` — exit 0
- `pytest apps/api/tests/test_smoke.py -q` — 3 passed

## Reality

PASS — LIVE/SAMPLE sticker contrast matches Launch-10 OG pattern (#2ec4b6 teal).
