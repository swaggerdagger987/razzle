# Evidence — lab-og-tolab-rankings-position

**Date:** 2026-05-31  
**Atom:** `lab-og-tolab-rankings-position` — dynasty rankings OG watermark includes default WR in toLab.

## Commands

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_lab_og_tolab_watermark.py -q --noconftest
# 9 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/og-rankings.png -w '%{http_code} %{size_download}' \
  'http://127.0.0.1:3000/og/rankings?download=1'
# 200 68317
```

## Change

`TOLAB_DEFAULT_POSITION.rankings = "WR"` mirrors weekly heatmap hallway pattern; closes position-defaults epic 3/3.

## Verdict

PASS — FACTORY-DOD Gate C.
