# Evidence — league-sos-og-trust-stickers (2026-05-31)

## Commands

```text
pytest apps/api/tests/test_og_bureau_sos_sticker.py -q  # 1 passed
npm run build --workspace=apps/web  # exit 0
curl -s -o /tmp/sos-og.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/strength-of-schedule?download=1"
# 200 67554 — PNG 1200x630
```

## Verdict

PASS — LIVE/SAMPLE/EXPORTED stickers on Bureau SoS OG; Gate C ≥40KB.
