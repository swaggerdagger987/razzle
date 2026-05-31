# Evidence — Lab L5 percentiles OG toLab default player

**Date:** 2026-05-31  
**Atom:** `lab-og-percentiles-tolab`  
**Route:** `/og/percentiles`

## Commands

```bash
python3 -m pytest apps/api/tests/test_lab_og_percentiles_tolab.py -q --noconftest
# 3 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/og-percentiles.png -w '%{http_code} %{size_download}' \
  'http://127.0.0.1:3000/og/percentiles?download=1&player_id=00-0036900&name=Ja%27Marr%20Chase&position=WR'
# 200 66320
```

## Verdict

**PASS** — Percentiles export passes default player name + WR position; `labOgWatermarkLink` includes percentiles in default-player set; pro profile OG epic complete.
