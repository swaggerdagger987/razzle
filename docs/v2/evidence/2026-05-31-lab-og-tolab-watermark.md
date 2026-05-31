# Evidence — Lab OG toLab watermark (cycle 140)

**Slice:** `lab-og-tolab-watermark`  
**Date:** 2026-05-31

## Commands

```bash
pytest apps/api/tests/test_lab_og_tolab_watermark.py -q
# 3 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/og-rankings.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/rankings?download=1"
# 200 66806
file /tmp/og-rankings.png
# PNG 1200x630
```

## Claim

Launch-10 Lab panel OG export cards show a terracotta watermark band with a typed
`toLab()` hallway path (includes `position=` when filtered; player query when
player-scoped and not the Ja'Marr default id).
