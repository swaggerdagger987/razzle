# Evidence — lab-og-live-sticker-prospects-weekly

**Date:** 2026-05-31  
**Routes:** `/og/weekly?download=1`, `/og/prospects?download=1`  
**Verdict:** PASS (Gate C)

## Commands

```bash
npm run build --workspace=apps/web
JWT_SECRET=test python3 -m pytest apps/api/tests -q
curl -s -o /tmp/og-weekly.png -w '%{http_code} %{size_download}\n' 'http://127.0.0.1:3000/og/weekly?download=1'
curl -s -o /tmp/og-prospects.png -w '%{http_code} %{size_download}\n' 'http://127.0.0.1:3000/og/prospects?download=1'
```

## Results

| Check | Result |
|-------|--------|
| web build | exit 0 |
| pytest | 55 passed, 5 skipped |
| curl weekly OG | `200 66512` |
| curl prospects OG | `200 60688` |
| PNG | 1200×630, ≥40KB each |

## Notes

- Weekly OG without `position` query now defaults `apiParams.position=WR` (matches `WeeklyHeatmapRenderer`) so `/api/panels/weekly` returns rows and LIVE sticker can show on Launch-10 slugs.
- Prospects OG unchanged; already in `LAUNCH_10_OG_SLUGS` with live extractors.
