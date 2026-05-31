# Evidence — Lab rankings OG live tier extract (2026-05-31)

**Slice:** `lab-rankings-og-live-blurb`  
**Atom:** 2/3 — Lab L5 live OG rows epic

## Change

- `extractRows` unwraps nested `data` objects and prefers flat `players[]` before `tiers[]` flatten.
- Rankings OG requests `limit=6`; panel fetch fallback sends `X-Razzle-Plan: pro`.

## Gate C

| Route | HTTP | Bytes | Notes |
|-------|------|-------|-------|
| `/og/rankings?download=1` | 200 | 59509 | PNG 1200×630 (demo fallback — terminal.db empty) |

```bash
curl -s -o /tmp/rankings-og.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/rankings?download=1'
# 200 59509
file /tmp/rankings-og.png
# PNG image data, 1200 x 630
```

## Build / tests

- `JWT_SECRET=test .venv-v2/bin/python -m pytest apps/api/tests -q` → 51 passed, 5 skipped
- `npm run build --workspace=apps/web` → exit 0

## Verdict

PASS — Gate C2 (PNG ≥40KB). Live path ready for dynasty `players`/`tiers` when API returns rows; launch-10 blurb omits sample preview when `showingLiveData`.
