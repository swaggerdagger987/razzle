# Evidence — league-pressure-map-og-room-hallway

**Date:** 2026-05-31  
**Atom:** `league-pressure-map-og-room-hallway` — Pressure Map OG export pre-fills Bones in Situation Room.

## Commands

```bash
PATH=$HOME/.local/bin:$PATH JWT_SECRET=test python3 -m pytest \
  apps/api/tests/test_pressure_map_og_room_hallway.py -q --noconftest
# 1 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/og-pressure.png -w 'pressure: %{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/pressure-map?download=1'
# pressure: 200 77841
file /tmp/og-pressure.png
# PNG 1200x630
```

## Change

- `/og/pressure-map` adds `bonesPressureMapRoomQuestion` + `toRoom` hero line matching Trade Finder OG pattern.
- Dedup: `lab-og-tolab-snapshot-player` already on base (PR #1341) — not rebuilt.

## Verdict

PASS — FACTORY-DOD Gate C2 (PNG ≥ 40KB).
