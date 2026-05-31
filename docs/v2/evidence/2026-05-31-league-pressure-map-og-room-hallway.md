# Evidence — league-pressure-map-og-room-hallway

**Date:** 2026-05-31  
**Atom:** `league-pressure-map-og-room-hallway` — Pressure Map OG export links to Bones Room ask.

## Commands

```bash
PATH=$HOME/.local/bin:$PATH JWT_SECRET=test python3 -m pytest \
  apps/api/tests/test_pressure_map_og_room_hallway.py -q --noconftest
# 1 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/og-pressure-map.png -w 'pressure-map: %{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/pressure-map?download=1'
# pressure-map: 200 77533
file /tmp/og-pressure-map.png
# PNG 1200x630
```

## Change

- `/og/pressure-map` uses `toRoom` + `bonesPressureMapRoomQuestion` (matches in-panel Bureau ask).
- Terracotta watermark band + `razzle.lol${bonesRoomPath}` hallway line on export card.

## Verdict

PASS — FACTORY-DOD Gate C2 (PNG ≥ 40KB); crossRoomLinkPresent.
