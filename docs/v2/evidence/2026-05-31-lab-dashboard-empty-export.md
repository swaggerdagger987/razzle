# Evidence — lab-dashboard-empty-export

**Date:** 2026-05-31  
**Atom:** `lab-dashboard-empty-export`  
**Verdict:** PASS

## Gate C — OG preview

```bash
curl -s -o /tmp/dashboard-og.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/dashboard?download=1"
# 200 66547
file /tmp/dashboard-og.png
# PNG image data, 1200 x 630
```

## Builder

- `DASHBOARD_SAMPLE_OG_ROWS` in `DynastyDashboardRenderer.tsx` aligned with `/og/[panel]` `DEMO_ROWS_BY_SLUG.dashboard`
- `isEmptyBoard` when no top5/risers/fallers/value_picks → `export sample card` footer
- `pytest` 10 passed; `npm run build --workspace=apps/web` exit 0

## Trust

T5 (Lab depth / screenshot-worthy exports), T6 (voice — empty copy + sample card label)
