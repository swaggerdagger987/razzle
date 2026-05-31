# Evidence — lab-og-from-panel-gate-c-rest

**Date:** 2026-05-31  
**Atom:** Gate C pytest + curl for prospects/tradevalues snapshot FROM PANEL  
**Trust:** T5, T6

## Build

- `python3 -m pytest apps/api/tests/test_og_from_panel_sticker.py apps/api/tests/test_og_launch10_snapshot_gate_c.py -q --noconftest` — 10 passed
- `npm run build --workspace=apps/web` — exit 0

## Gate C — snapshot OG PNG

```bash
PROSPECTS_SNAP='W3sibiI6IlRyYXZpcyBIdW50ZXIiLCJwIjoiV1IiLCJ0IjoiSkFYIiwicyI6OTQsInNsIjoiU2NvcmUifV0'
TV_SNAP='W3sibiI6IkphJ01hcnIgQ2hhc2UiLCJwIjoiV1IiLCJ0IjoiQ0lOIiwicyI6MTAyMDAsInNsIjoiVmFsdWUifV0'

curl -s -o /tmp/og-prospects-snap.png -w '%{http_code} %{size_download}\n' \
  "http://127.0.0.1:3000/og/prospects?download=1&snapshot=${PROSPECTS_SNAP}"
# prospects 200 50148

curl -s -o /tmp/og-tradevalues-snap.png -w '%{http_code} %{size_download}\n' \
  "http://127.0.0.1:3000/og/tradevalues?download=1&snapshot=${TV_SNAP}"
# tradevalues 200 50462
```

## Verdict

PASS — documented snapshot fixtures + curl PNGs ≥40KB.
