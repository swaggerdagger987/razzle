# Evidence — Lab L5 percentiles OG live extract

**Date:** 2026-05-31  
**Atom:** `lab-og-percentiles-live-extract` — pro profile OG epic atom 1/4  
**Trust:** T5, T6

## Gate C — OG PNG

```bash
curl -s -o /tmp/og-percentiles.png -w "%{http_code} %{size_download}\n" \
  "http://127.0.0.1:3000/og/percentiles?download=1&player_id=00-0036900"
file /tmp/og-percentiles.png
```

| Result | Value |
|--------|-------|
| HTTP | 200 |
| Size | 62517 bytes |
| Type | PNG 1200×630 |

## Tests

```bash
python3 -m pytest apps/api/tests/test_lab_og_percentiles_live.py -q --noconftest
# 2 passed
npm run build --workspace=apps/web
# exit 0
```

**Verdict:** PASS — percentiles OG uses `extractPercentilesRows` on live API payload; demo fallback + LIVE sticker when API empty.
