# Evidence — lab-og-percentiles-tolab

**Date:** 2026-05-31  
**Atom:** `lab-og-percentiles-tolab` — pytest contract for percentiles default player toLab (T6)  
**Trust:** T5, T6

## Build

- `JWT_SECRET=test python3 -m pytest apps/api/tests/test_lab_og_tolab_watermark.py -q --noconftest` — 11 passed
- `npm run build --workspace=apps/web` — exit 0

## Gate C

```bash
curl -s -o /tmp/og-percentiles.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/percentiles?player_id=00-0036900&download=1'
# 200 63863 — PNG 1200×630
```

## Verdict

PASS — percentiles in `TOLAB_INCLUDE_DEFAULT_PLAYER_SLUGS`; pro profile OG epic complete.
