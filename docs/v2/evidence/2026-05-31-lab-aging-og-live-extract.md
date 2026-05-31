# Evidence — Lab aging OG live extract (2026-05-31)

**Slice:** `lab-aging-og-live-extract` — OG route flattens `positions.{POS}.players` for aging-curves API  
**Atom:** 1/3 — Lab L5 live OG rows epic

## Gate C

| Check | Result |
|-------|--------|
| Route | `GET /og/aging?download=1&position=RB` |
| HTTP | 200 |
| PNG size | 44,952 bytes (≥40KB) |
| Format | PNG 1200×630 |

```bash
curl -s -o /tmp/aging-og.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/aging?download=1&position=RB'
# 200 44952
file /tmp/aging-og.png
# PNG image data, 1200 x 630
```

## Build

- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` → 51 passed, 5 skipped
- `npm run build --workspace=apps/web` → exit 0

## Verdict

PASS — live aging players render on OG card without snapshot param (nested `positions` map extracted).
