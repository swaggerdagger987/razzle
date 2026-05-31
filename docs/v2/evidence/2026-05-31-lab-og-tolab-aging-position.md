# Evidence — lab-og-tolab-aging-position

**Date:** 2026-05-31  
**Atom:** `lab-og-tolab-aging-position` — aging RB in OG toLab watermark  
**Verdict:** PASS

## Commands

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_lab_og_tolab_watermark.py -q --noconftest
npm run build --workspace=apps/web
curl -s -o /tmp/og-aging.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/aging?download=1'
```

## Results

| Check | Output |
|-------|--------|
| pytest | 9 passed |
| web build | exit 0 |
| curl aging OG | `200 65583` |

## Behavior

`TOLAB_DEFAULT_POSITION.aging` mirrors `AgingCurvesRenderer` default RB so
`razzle.lol/lab/aging?position=RB` matches the in-panel curve when URL omits position.

## Trust

T5, T6
