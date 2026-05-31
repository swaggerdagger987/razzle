# Evidence — lab-og-from-panel-gate-c-rest

**Date:** 2026-05-31  
**Atom:** `lab-og-from-panel-gate-c-rest` — Gate C pytest + curl for prospects/tradevalues FROM PANEL snapshot  
**Trust:** T5, T6

## Build

- `JWT_SECRET=test python3 -m pytest apps/api/tests/test_og_from_panel_sticker.py -q --noconftest` — 5 passed
- `npm run build --workspace=apps/web` — exit 0

## Gate C — snapshot OG PNG

```bash
curl -s -o /tmp/prospects-snap.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/prospects?download=1&snapshot=<6-row RPS board>'
# 200 63977

curl -s -o /tmp/tradevalues-snap.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/tradevalues?download=1&snapshot=<6-row value curve>'
# 200 67179
```

## Verdict

PASS — prospects/tradevalues snapshot exports ≥40KB PNG with FROM PANEL contract guarded in pytest; formula OG epic 3/3 complete.
