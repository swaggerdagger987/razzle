# Evidence — lab-og-from-panel-gate-c-rest

**Date:** 2026-05-31  
**Atom:** Gate C pytest + curl for prospects/tradevalues snapshot FROM PANEL  
**Trust:** T5, T6

## Build

- `JWT_SECRET=test python3 -m pytest apps/api/tests/test_og_from_panel_sticker.py apps/api/tests/test_lab_og_snapshot_codec.py -q --noconftest` — 6 passed
- `npm run build --workspace=apps/web` — exit 0

## Gate C — snapshot OG PNG

```bash
# PROSPECTS_SNAPSHOT_PARAM / TRADEVALUES_SNAPSHOT_PARAM from test_lab_og_snapshot_codec.py
curl -s -o /tmp/og-prospects-snap.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/prospects?download=1&snapshot=<PROSPECTS_SNAP>'
# 200 54781

curl -s -o /tmp/og-tradevalues-snap.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/tradevalues?download=1&snapshot=<TRADEVALUES_SNAP>'
# 200 55047
```

## Code

- `apps/api/tests/test_lab_og_snapshot_codec.py` — encodeOgSnapshot mirror + fixture params
- `apps/api/tests/test_og_from_panel_sticker.py` — prospects/tradevalues in SNAPSHOT_FROM_PANEL_SLUGS + renderer snapshot contract

## Verdict

PASS — prospects/tradevalues snapshot exports ≥40KB PNG with FROM PANEL contract guarded in pytest.
