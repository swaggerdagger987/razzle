# Evidence — Lab OG live panel row extractors

**Date:** 2026-05-31  
**Slice:** `lab-og-live-extractors`  
**Atom:** OG route live row extraction via panels API  

## Gate C — OG PNG

| Route | HTTP | Bytes | Notes |
|-------|------|-------|-------|
| `/og/rankings?download=1` | 200 | 59509 | PNG 1200×630, demo rows (no terminal.db) |
| `/og/breakouts?download=1` | 200 | 60649 | PNG 1200×630, demo rows |

```bash
curl -s -o /tmp/og-rankings-live.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/rankings?download=1"
curl -s -o /tmp/og-breakouts-live.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/breakouts?download=1"
file /tmp/og-rankings-live.png /tmp/og-breakouts-live.png
```

## Build / tests

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped

## Verdict

**PASS** — Gate C2 satisfied (PNG ≥40KB). Live path uses `/api/panels/{slug}` with `X-Razzle-Plan: pro` and `candidates` extraction; demo fallback unchanged when API empty.
