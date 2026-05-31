# Evidence — Bureau H2H OG SAMPLE sticker (2026-05-31)

**Atom:** `bureau-h2h-og-sample-sticker`  
**Route:** `GET /og/head-to-head?download=1` (demo path, no league params)

## Gate C — curl

```text
HTTP 200 size 75595
/tmp/og-h2h-demo.png: PNG image data, 1200 x 630, 8-bit/color RGBA, non-interlaced
```

≥40KB PNG with static `DEMO_H2H` rows and terracotta **SAMPLE · demo rivalry preview** sticker.

## Build

```text
npm run build --workspace=apps/web → exit 0
JWT_SECRET=test pytest apps/api/tests/test_smoke.py → 3 passed
```

## Verdict

**PASS** — demo path shows SAMPLE sticker; LIVE path unchanged (teal sticker when `isLive`).
