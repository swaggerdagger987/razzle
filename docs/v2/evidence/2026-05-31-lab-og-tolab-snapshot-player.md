# Evidence — lab-og-tolab-snapshot-player

**Date:** 2026-05-31  
**Atom:** `lab-og-tolab-snapshot-player` — snapshot payload embeds `pid` so OG watermark `toLab` survives snapshot-only URLs.

## Commands

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_lab_og_tolab_watermark.py -q --noconftest
# 4 passed

npm run build --workspace=apps/web
# exit 0

SNAP=$(python3 -c "import json,base64; p={'pid':'00-0031234','r':[{'n':'J. Chase','p':'WR','t':'CIN','s':24.2,'sl':'FPTS'}]}; print(base64.urlsafe_b64encode(json.dumps(p).encode()).decode().rstrip('='))")
curl -s -o /tmp/og-gamelog-snap.png -w '%{http_code} %{size_download}\n' \
  "http://127.0.0.1:3000/og/gamelog?download=1&snapshot=$SNAP"
# 200 53016
```

## Change

- `LabOgExportLink.encodeOgSnapshot` wraps `{ pid, r }` when `playerId` is set.
- `/og/[panel]` `decodeOgSnapshot` reads `pid` into `effectivePlayerId` for `labOgWatermarkLink`.

## Verdict

PASS — FACTORY-DOD Gate C (PNG ≥ 40KB; hallway player preserved on snapshot export).
