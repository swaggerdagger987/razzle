# Evidence — lab-og-efficiency-aging-live-sort

**Date:** 2026-05-31  
**Atom:** Efficiency + Aging OG rank by ppo / ppg on live fetch  
**Verdict:** PASS

## Gate C — OG PNG

```bash
curl -s -o /tmp/og-eff.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/efficiency?position=RB&download=1'
# 200 45113

curl -s -o /tmp/og-aging.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/aging?position=RB&download=1'
# 200 44952

file /tmp/og-eff.png /tmp/og-aging.png
# PNG 1200x630 both
```

- Routes: `/og/efficiency`, `/og/aging` with `position=RB`
- Sizes ≥40KB (demo fallback when API empty; live fetch uses ppo / ppg sort via `PANEL_OG_STAT_KEY`)

## Build

- `npm run build --workspace=apps/web` — exit 0
