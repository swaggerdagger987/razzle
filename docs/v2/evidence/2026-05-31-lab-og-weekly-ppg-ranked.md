# Evidence — lab-og-weekly-ppg-ranked (cycle 94)

| Check | Result |
|-------|--------|
| `WeeklyHeatmapRenderer` | filters `p.position === position` before PPG sort |
| `npm run build --workspace=apps/web` | exit 0 |
| `curl /og/weekly?download=1` | 200 63819B PNG |
