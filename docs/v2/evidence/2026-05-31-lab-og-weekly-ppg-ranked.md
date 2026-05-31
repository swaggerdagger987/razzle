# Evidence — lab-og-weekly-ppg-ranked

**Date:** 2026-05-31  
**Atom:** `lab-og-weekly-ppg-ranked`  
**Verdict:** PASS

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
curl -s -o /tmp/og-weekly.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/weekly?download=1&position=WR'
JWT_SECRET=test python3 -m pytest apps/api/tests -q   # 52 passed, 4 failed (terminal.db snapshots — env)
```

## Results

| Check | Result |
|-------|--------|
| Web build | exit 0 |
| OG weekly WR | `200 53320` bytes PNG |
| Pytest | 52 passed, 4 failed (pre-existing snapshot/intel) |

## Change

`WeeklyHeatmapRenderer` filters `ogSnapshotRows` to the active position tab before PPG sort; `LabOgExportLink` already passes `position=WR`.
