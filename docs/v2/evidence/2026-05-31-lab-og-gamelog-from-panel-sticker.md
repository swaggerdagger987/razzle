# Evidence — lab-og-gamelog-from-panel-sticker

**Date:** 2026-05-31  
**Atom:** `lab-og-gamelog-from-panel-sticker`  
**Cycle:** 143

## Gate C

```bash
SNAP='W3sibiI6ICJXayAxMiIsICJwIjogIldSIiwgInQiOiAiQ0lOIiwgInMiOiAzMS40LCAic2wiOiAiUFBSIn0sIHsibiI6ICJXayA4IiwgInAiOiAiV1IiLCAidCI6ICJDSU4iLCAicyI6IDI4LjQsICJzbCI6ICJQUFIifV0'
curl -s -o /tmp/gamelog-snap.png -w '%{http_code} %{size_download}\n' \
  "http://127.0.0.1:3000/og/gamelog?download=1&player_id=00-0036900&snapshot=$SNAP"
# 200 49720
```

## Tests

- `pytest apps/api/tests/test_og_from_panel_sticker.py -q` — 3 passed
- `npm run build --workspace=apps/web` — exit 0

**Verdict:** PASS
