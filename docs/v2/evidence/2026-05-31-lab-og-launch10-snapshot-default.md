# Evidence — lab-og-launch10-snapshot-default

**Date:** 2026-05-31  
**Atom:** Launch-10 panels — prefer live API before demo fallback  
**Trust:** T5, T6

## Build

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 55 passed, 5 skipped

## Gate C — OG PNG without snapshot (live API path)

```bash
curl -s -o /tmp/rankings-og.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/rankings?download=1'
# 200 62355

curl -s -o /tmp/weekly-og.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/weekly?download=1'
# 200 66512

file /tmp/rankings-og.png /tmp/weekly-og.png
# PNG 1200x630 each
```

## Code

- `fetchOgLiveRows()` — Launch-10 slugs call `fetchPanelData` (with `X-Razzle-Plan: pro`) before `/api/panels/{slug}`; demo only when both return no named rows.
- `OG_FETCH_HEADERS` shared on panel API + panels slug fetch.

## Verdict

PASS — Launch-10 OG exports without snapshot render live nflverse rows (≥40KB PNG), not demo fallback when API is reachable.
