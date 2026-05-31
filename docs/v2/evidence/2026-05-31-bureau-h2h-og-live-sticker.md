# Evidence — Bureau H2H OG LIVE sticker (2026-05-31)

**Slice:** `bureau-h2h-og-live-sticker`  
**Route:** `/og/head-to-head?download=1`  
**Verdict:** PASS

## Build

```
npm run build --workspace=apps/web → exit 0
JWT_SECRET=test pytest apps/api/tests/test_smoke.py → 3 passed
```

## Gate C — OG PNG

```bash
curl -s -o /tmp/og-h2h-demo.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/head-to-head?download=1'
# 200 67846
file /tmp/og-h2h-demo.png
# PNG 1200x630
```

Demo path (no league params): SAMPLE blurb + rivalry cards; **no** teal LIVE sticker (correct — `isLive` false).

LIVE sticker: teal Caveat badge `LIVE · league rivalry` when `fetchH2H` returns `you` + `them` (mirrors Lab Launch-10 LIVE sticker).

## Trust

- **T5:** Bureau export parity with Lab OG trust signals
- **T6:** Screenshot gravity — live vs demo obvious on rivalry cards
