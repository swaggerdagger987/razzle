# Evidence — Lab weekly OG PPG ranking (lab-og-weekly-ppg-ranked)

**Date:** 2026-05-31  
**Atom:** `lab-og-weekly-ppg-ranked`  
**Verdict:** PASS

## Acceptance

| Check | Result |
|-------|--------|
| `npm run build --workspace=apps/web` | exit 0 |
| `JWT_SECRET=test python3 -m pytest apps/api/tests -q` | 52 passed (screener snapshot failures pre-existing on base) |

## Gate C

```bash
curl -s -o /tmp/og-weekly.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/weekly?download=1&position=WR"
# 200 53320
file /tmp/og-weekly.png  # PNG 1200x630
```

## Change

- `extractRows` sorts by `ppg` before top-6 slice.
- Live weekly OG applies position filter before slice; sorts rows by stat (PPG) desc.
