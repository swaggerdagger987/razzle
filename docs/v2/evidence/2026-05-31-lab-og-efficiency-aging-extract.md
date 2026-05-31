# Evidence — Lab OG efficiency + aging live extractors

**Date:** 2026-05-31  
**Atom:** `lab-og-efficiency-aging-extract`  
**Slice:** OG `extractRows` for `most_efficient` / `positions.players` payloads  

## Gate C — OG PNG

| Route | HTTP | Bytes | Notes |
|-------|------|-------|-------|
| `/og/efficiency?download=1` | 200 | 59068 | PNG 1200×630, demo rows (no terminal.db) |
| `/og/aging?download=1` | 200 | 57934 | PNG 1200×630, demo rows |

```bash
curl -s -o /tmp/og-efficiency.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/efficiency?download=1"
curl -s -o /tmp/og-aging.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/aging?download=1"
```

## Build / tests

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped

## Verdict

**PASS** — Gate C2 satisfied (PNG ≥40KB). Live path extracts `most_efficient` (PPO) and aging `positions.*.players` (PPG).
