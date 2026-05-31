# Evidence — League L5 Manager Profiles copy link

**Date:** 2026-05-31  
**Slice:** Bureau Manager Profiles share row — copy link + export card  
**Verdict:** PASS

## Gate C — OG PNG

```bash
curl -s -o /tmp/og-manager-profiles.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/manager-profiles?league=test&download=1'
file /tmp/og-manager-profiles.png
```

| Check | Result |
|-------|--------|
| HTTP | 200 |
| Size | 77194 bytes (≥40KB) |
| Format | PNG 1200×630 |

## Build / tests

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped

## In-product

- `BureauManagerProfiles` footer: copy link button + export card on same row (mirrors Self-Scout).
