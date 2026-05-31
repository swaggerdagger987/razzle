# Evidence — Lab OG efficiency + aging live sort keys

**Date:** 2026-05-31  
**Slice:** `lab-og-efficiency-aging-live-sort`  
**Atom:** OG route ranks efficiency by PPO and aging by age on live fetch  

## Gate C — OG PNG

| Route | HTTP | Bytes | Notes |
|-------|------|-------|-------|
| `/og/efficiency?position=WR&download=1` | 200 | 48610 | PNG 1200×630, demo fallback (no terminal.db) |
| `/og/aging?position=WR&download=1` | 200 | 44093 | PNG 1200×630, demo fallback |

```bash
curl -s -o /tmp/og-efficiency.png -w "%{http_code} %{size_download}\n" \
  "http://127.0.0.1:3000/og/efficiency?position=WR&download=1"
curl -s -o /tmp/og-aging.png -w "%{http_code} %{size_download}\n" \
  "http://127.0.0.1:3000/og/aging?position=WR&download=1"
file /tmp/og-efficiency.png /tmp/og-aging.png
```

## Build / tests

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped

## Verdict

**PASS** — Gate C2 satisfied (PNG ≥40KB). `PANEL_OG_STAT_KEY` uses `ppo` / `age`; extractors handle `most_efficient` and nested `positions.players`.
