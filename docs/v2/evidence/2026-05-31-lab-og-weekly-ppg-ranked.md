# Evidence — lab-og-weekly-ppg-ranked

**Date:** 2026-05-31  
**Atom:** `lab-og-weekly-ppg-ranked`  
**Epic:** Lab L5 — OG snapshot row fidelity (atom 2/3)

## Change

`/og/[panel]` ranks `weekly` live and snapshot rows by PPG (top-6) after position filter; fetches limit 25 for weekly pool; demo rows use PPG label.

## Gate C

```bash
npm run build --workspace=apps/web   # exit 0
curl -s -o /tmp/og-weekly-wr.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/weekly?position=WR&download=1'
# 200 53256
file /tmp/og-weekly-wr.png
# PNG 1200x630
```

## Verdict

**PASS** — PNG ≥40KB, route 200, PPG-ranked leaders for WR tab.
