# Evidence — lab-og-from-panel-sticker-evidence

**Date:** 2026-05-31  
**Atom:** `lab-og-from-panel-sticker-evidence` — pytest + Gate C curl for rankings/weekly FROM PANEL snapshot stickers  
**Trust:** T5, T6

## Build

- `JWT_SECRET=test python3 -m pytest apps/api/tests/test_og_from_panel_sticker.py -q` — 2 passed
- `npm run build --workspace=apps/web` — exit 0

## Gate C — snapshot OG PNG

```bash
# base64url snapshot with two WR rows (matches LabOgExportLink codec)
curl -s -o /tmp/rankings-snap.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/rankings?download=1&snapshot=<SNAP>'
# 200 56682

curl -s -o /tmp/weekly-snap.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/weekly?download=1&snapshot=<SNAP>'
# 200 58270
```

## Code

- `apps/api/tests/test_og_from_panel_sticker.py` — asserts rankings + weekly in `LAUNCH_10_OG_SLUGS`, blurb `from your panel`, trust blue `#5b7fff` sticker path (route shipped atom 1).

## Verdict

PASS — rankings/weekly snapshot exports ≥40KB PNG with FROM PANEL contract guarded in pytest.
