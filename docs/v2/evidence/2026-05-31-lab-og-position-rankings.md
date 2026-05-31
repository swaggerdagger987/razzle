# Evidence — Lab L5 OG position filter (rankings)

**Date:** 2026-05-31  
**Atom:** `lab-og-position-rankings`  
**Verdict:** PASS

## Gate C — OG PNG

| Route | HTTP | Bytes | Notes |
|-------|------|-------|-------|
| `/og/rankings?download=1&position=WR` | 200 | 50210 | WR-only demo rows when API empty; blurb shows "WR only" |
| `/og/rankings?download=1` | 200 | 59509 | Unfiltered card |

```bash
curl -s -o /tmp/og-rankings-wr.png -w '%{http_code} %{size_download}' \
  'http://localhost:3000/og/rankings?download=1&position=WR'
file /tmp/og-rankings-wr.png
```

## Build / tests

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped

## Product check

- `LabOgExportLink` forwards `position` from dynasty rankings panel state.
- OG route passes `position` to API and filters demo rows to match filtered export.
