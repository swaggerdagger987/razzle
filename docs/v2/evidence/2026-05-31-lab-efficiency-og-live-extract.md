# Evidence — Lab efficiency OG live extract (2026-05-31)

**Slice:** `lab-efficiency-og-live-extract`  
**Atom:** 3/3 — Lab L5 live OG rows epic

## Gate C

| Route | HTTP | Bytes | Notes |
|-------|------|-------|-------|
| `/og/efficiency?download=1` | 200 | 59068 | PNG 1200×630 |

```bash
curl -s -o /tmp/efficiency-og.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/efficiency?download=1'
```

## Build / tests

- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` → 51 passed, 5 skipped
- `npm run build --workspace=apps/web` → exit 0

## Verdict

PASS — Gate C2 (PNG ≥40KB).
