# Evidence — lab-og-tolab-gamelog-default

**Date:** 2026-05-31  
**Atom:** `lab-og-tolab-gamelog-default`  
**Cycle:** 143

## Change

`labOgWatermarkLink` keeps typed `toLab("gamelog", …)` player context when the OG card uses the showcase `DEFAULT_OG_PLAYER_ID` (Ja'Marr Chase). Other player-scoped panels still omit the default id from the watermark to avoid fake deep links.

## Commands

```bash
python3 -m pytest apps/api/tests/test_lab_og_tolab_gamelog_default.py \
  apps/api/tests/test_lab_og_tolab_watermark.py -q --noconftest
# 6 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/gamelog-og.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/gamelog?download=1'
# 200 65777
file /tmp/gamelog-og.png
# PNG image data, 1200 x 630
```

## Verdict

PASS — FACTORY-DOD Gate C (PNG ≥ 40KB). T5/T6 hallway deep link on default gamelog export.
