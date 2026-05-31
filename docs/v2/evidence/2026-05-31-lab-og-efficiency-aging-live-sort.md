# Evidence — Lab L5 Efficiency + Aging OG live sort keys

**Date:** 2026-05-31  
**Atom:** `lab-og-efficiency-aging-live-sort`

## Change

`apps/web/app/og/[panel]/route.tsx` — `PANEL_OG_STAT_KEY` adds `efficiency: efficiency_score` and `aging: peak_age`; stat labels for live fetch ranking via `rankOgRowsForPanel`.

## Commands (executed)

```bash
npm run build --workspace=apps/web
curl -s -o /tmp/eff.png -w '%{http_code} %{size_download}\n' 'http://127.0.0.1:3000/og/efficiency?download=1'
curl -s -o /tmp/aging.png -w '%{http_code} %{size_download}\n' 'http://127.0.0.1:3000/og/aging?download=1'
```

## Results

| Route | Output |
|-------|--------|
| efficiency | 200 59068 |
| aging | 200 57916 |

## Reality

PASS — Gate C (PNG ≥40KB each).
