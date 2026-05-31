# Evidence — Lab L5 prospects OG items[] fallback

**Date:** 2026-05-31  
**Atom:** `lab-og-prospects-items-live`  
**Slice:** Prospects OG uses `items[]` with RPS extract when `prospects` is empty

## Gate C — curl

| Route | HTTP | Bytes | Notes |
|-------|------|-------|-------|
| `/og/prospects?download=1` | 200 | 60688 | PNG 1200×630, demo/live rows |

```bash
curl -s -o /tmp/prospects-og.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/prospects?download=1'
file /tmp/prospects-og.png
```

## Build

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 55 passed, 5 skipped

**Verdict:** PASS — prospects slug tries `items[]` via `extractProspectsRows` when `prospects` is missing or empty.
