# Evidence — lab-og-tolab-weekly-position

**Date:** 2026-05-31  
**Atom:** `lab-og-tolab-weekly-position` — weekly WR in OG toLab watermark  
**Verdict:** PASS

## Commands

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_lab_og_tolab_watermark.py -q --noconftest
npm run build --workspace=apps/web
curl -s -o /tmp/og-weekly2.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/weekly?download=1'
```

## Results

| Check | Output |
|-------|--------|
| pytest | 6 passed |
| web build | exit 0 |
| curl weekly OG | `200 71581` |

## Behavior

`TOLAB_DEFAULT_POSITION.weekly` feeds both API default and `watermarkPosition` so
`razzle.lol/lab/weekly?position=WR` matches the WR heatmap when URL omits position.

## Trust

T5, T6
