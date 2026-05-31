# Evidence — Lab OG snapshot player in toLab watermark

**Slice:** `lab-og-tolab-snapshot-player`  
**Date:** 2026-05-31

## Commands

```bash
pytest apps/api/tests/test_lab_og_tolab_watermark.py -q
# 8 passed

SNAP=$(python3 -c 'import json,base64; rows=[{"n":"Ja'\''Marr Chase","p":"WR","t":"CIN","s":24.1,"sl":"PPR"}]; print(base64.urlsafe_b64encode(json.dumps(rows).encode()).decode().rstrip("="))')
curl -s -o /tmp/og-gamelog-snap.png -w "%{http_code} %{size_download}\n" \
  "http://127.0.0.1:3000/og/gamelog?download=1&player_id=00-0036900&snapshot=${SNAP}"
# 200 53756
```

## Claim

Snapshot panel OG exports keep player context in the terracotta watermark via
`snapshotPreservesPlayer` when `snapshot=` rows lack an encoded pid.
