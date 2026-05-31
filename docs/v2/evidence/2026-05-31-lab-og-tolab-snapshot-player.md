# Evidence — Lab OG snapshot player in toLab watermark

**Slice:** `lab-og-tolab-snapshot-player`  
**Date:** 2026-05-31

## Commands

```bash
pytest apps/api/tests/test_lab_og_tolab_watermark.py -q --noconftest
# 4 passed

npm run build --workspace=apps/web
# exit 0

SNAP=$(python3 -c 'import json,base64; rows=[{"n":"Ja'\''Marr Chase","p":"WR","t":"CIN","s":24.1,"sl":"PPR"}]; print(base64.urlsafe_b64encode(json.dumps(rows).encode()).decode().rstrip("="))')
curl -s -o /tmp/og-gamelog-snap.png -w "%{http_code} %{size_download}\n" \
  "http://127.0.0.1:3000/og/gamelog?download=1&player_id=00-0036900&snapshot=${SNAP}"
# 200 53756
file /tmp/og-gamelog-snap.png
# PNG 1200x630
```

## Claim

Player-scoped Lab OG cards exported with `snapshot=` keep the typed `toLab()` player
context in the terracotta watermark band (closes hallway deep-links epic 3/3).
