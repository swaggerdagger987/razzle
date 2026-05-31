# Evidence — lab-og-from-panel-gate-c-rest

**Date:** 2026-05-31  
**Atom:** 3/3 — Gate C pytest + curl for prospects/tradevalues snapshot FROM PANEL  
**Trust:** T5, T6

## Build

- `python3 -m pytest apps/api/tests/test_og_from_panel_sticker.py -q --noconftest` — 2 passed
- `npm run build --workspace=apps/web` — exit 0

## Gate C — snapshot OG PNG (prospects + tradevalues)

```bash
SNAP=<base64url top-2 rows with RPS labels>
curl -s -o /tmp/prospects-snap.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/prospects?download=1&snapshot='"$SNAP"
# 200 54559

curl -s -o /tmp/tradevalues-snap.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/tradevalues?download=1&snapshot='"$SNAP"
# 200 54173

file /tmp/prospects-snap.png /tmp/tradevalues-snap.png
# PNG 1200x630 each
```

## Code

- `apps/api/tests/test_og_from_panel_sticker.py` — `SNAPSHOT_FROM_PANEL_SLUGS` includes `prospects` + `tradevalues`; route already renders `FROM PANEL · your rows` for all Launch-10 snapshots.

## Verdict

PASS — Big Board + Trade Values snapshot exports meet Gate C (≥40KB PNG, FROM PANEL sticker path covered by pytest).
