# Evidence — lab-og-weekly-ppg-ranked

**Date:** 2026-05-31  
**Atom:** Weekly OG export ranks top-6 by PPG for active position tab  
**Verdict:** PASS

## Gate C — OG PNG

```bash
curl -s -o /tmp/og-weekly-wr.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/weekly?position=WR&download=1'
# 200 53249

file /tmp/og-weekly-wr.png
# PNG image data, 1200 x 630
```

- Route: `/og/weekly?position=WR&download=1`
- Size: 53,249 bytes (≥40KB)
- Demo rows sorted by PPG with WR position filter when API empty

## Build

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped
