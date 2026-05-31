# Evidence — Lab OG live/snapshot/demo subtitle labels

**Date:** 2026-05-31  
**Atom:** `lab-og-live-label`  
**File:** `apps/web/app/og/[panel]/route.tsx`

## Change

`ogSourceSuffix()` appends honest source tags on the panel blurb:

| Source | Suffix |
|--------|--------|
| In-panel snapshot query | ` · from your panel` |
| Live `/api` rows | ` · live tape` |
| Demo fallback | ` · sample preview` |
| Dynasty-comps demo | ` · comps for Ja'Marr Chase · sample preview` |

## Commands

```bash
npm run build --workspace=apps/web          # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  # 51 passed, 5 skipped
curl -s -o /tmp/og-rankings-demo.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/rankings?download=1'
# 200 59509
curl -s -o /tmp/og-rankings-snap.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/rankings?download=1&snapshot=eyJuIjoiTGFkZCIsInAiOiJXUiIsInQiOiJMQUMiLCJzIjoxMi40LCJzbCI6IkNoZyJ9XQ'
# 200 59509
file /tmp/og-rankings-demo.png  # PNG 1200x630
```

## Verdict

PASS — Gate C2 PNG ≥40KB on demo and snapshot paths; subtitle logic covers all three data sources.
