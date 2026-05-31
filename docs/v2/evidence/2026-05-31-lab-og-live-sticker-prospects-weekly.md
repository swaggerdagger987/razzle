# Evidence — lab-og-live-sticker-prospects-weekly

**Date:** 2026-05-31  
**Atom:** `lab-og-live-sticker-prospects-weekly`  
**Verdict:** PASS

## Gate C — OG PNG

| Route | HTTP | Bytes | Notes |
|-------|------|-------|-------|
| `/og/prospects?download=1` | 200 | 60688 | PNG 1200×630 |
| `/og/weekly?download=1` | 200 | 66512 | PNG 1200×630; hot-week extract on base |

```bash
curl -s -o /tmp/og-prospects.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/prospects?download=1'
curl -s -o /tmp/og-weekly.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/weekly?download=1'
```

## Build

- `npm run build --workspace=apps/web` — exit 0

## Product

- `extractProspectsRows` now runs on `obj.items` from `/api/panels/prospects` so `showingLiveData` triggers LIVE sticker + `· live nflverse rows` blurb.
