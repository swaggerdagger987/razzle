# Evidence — Bureau H2H OG force_demo QA param (2026-05-31)

**Atom:** `bureau-h2h-og-force-demo-qa`  
**Route:** `GET /og/head-to-head?download=1&force_demo=1&league=999&user=1&opponent=2`

## Gate C — curl

```text
HTTP 200 size 77736
/tmp/og-h2h-force-demo.png: PNG image data, 1200 x 630, 8-bit/color RGBA, non-interlaced
```

≥40KB PNG with `DEMO_H2H` rows and terracotta **SAMPLE · demo rivalry preview** sticker even when league params present (skips live fetch).

## Build

```text
npm run build --workspace=apps/web → exit 0
JWT_SECRET=test pytest apps/api/tests/test_smoke.py → 3 passed
```

## Verdict

**PASS** — `force_demo=1` skips H2H API fetch for Gate C curl; natural demo path unchanged.

<!-- ci retrigger -->
