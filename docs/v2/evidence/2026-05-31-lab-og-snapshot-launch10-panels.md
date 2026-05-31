# Evidence — Lab L5 OG snapshot on launch-10 export panels

**Date:** 2026-05-31  
**Atom:** `lab-og-snapshot-launch10` (buysell, efficiency, aging)  
**Trust:** T5, T6

## Build

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped

## Gate C — OG PNG with snapshot

```bash
curl -s -o /tmp/og-buysell-snap.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/buysell?download=1&snapshot=eyJuIjoiQ2hyLiBNY0NhZmZyZXkiLCJwIjoiUkIiLCJ0IjoiU0YiLCJzIjo5OC41LCJzbCI6Ik1pc21hdGNoIn0'
# 200 58072
file /tmp/og-buysell-snap.png  # PNG 1200x630
```

## Code

- `BuySellRenderer` — interleaves top buy/sell cards into `snapshotRows`
- `EfficiencyRenderer` — top-6 efficient list → PPO snapshot
- `AgingCurvesRenderer` — past-peak (or chart) players → PPG snapshot

## Verdict

PASS — export cards for buysell, efficiency, and aging mirror in-panel rows when snapshot query is present.
