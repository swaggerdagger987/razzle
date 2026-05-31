# Evidence — lab-og-from-panel-sticker-gamelog

**Date:** 2026-05-31  
**Atom:** `lab-og-from-panel-sticker-gamelog` — FROM PANEL on player-scoped gamelog snapshot export  
**Trust:** T5, T6

## Build

- `test_og_from_panel_sticker.py` — 4 tests passed (direct import)
- `npm run build --workspace=apps/web` — exit 0

## Gate C — gamelog snapshot OG PNG

```bash
SNAP=$(python3 -c "import json,base64; c=[{'n':'Wk 12','p':'WR','t':'CIN','s':28.5,'sl':'PPR'}]; print(base64.urlsafe_b64encode(json.dumps(c).encode()).decode().rstrip('='))")
curl -s -o /tmp/og-gamelog-snap.png -w '%{http_code} %{size_download}\n' \
  "http://127.0.0.1:3000/og/gamelog?download=1&player_id=00-0036900&snapshot=$SNAP"
# 200 47690
```

## Code

- `apps/api/tests/test_og_from_panel_sticker.py` — gamelog in `LAUNCH_10_OG_SLUGS` + `GamelogRenderer` snapshotRows contract
- `GamelogRenderer` already passes `ogSnapshotRows` → `LabOgExportLink` (no renderer change required)

## Verdict

PASS — gamelog snapshot export ≥40KB PNG; trust-sticker epic atom 3/3 complete.
