# Evidence — League L5 Pressure Map OG Bones Room hallway

**Date:** 2026-05-31  
**Atom:** `league-og-pressure-map-room-hallway`  
**Slice:** `/og/pressure-map` watermark + Bones `toRoom` ask line

| Check | Result |
|-------|--------|
| Contract test | `test_pressure_map_og_room_hallway.py` PASS (inline run) |
| Web build | `npm run build --workspace=apps/web` exit 0 |
| Route 200 | `curl localhost:3000/og/pressure-map?download=1` → 200 |
| PNG size | 77533 bytes (≥40KB) |
| Hallway | `toRoom` bones + `panelSlug: pressure-map` + terracotta watermark band |
| In-product parity | `BureauPressureMap.tsx` already has Bones ask link |

**Verdict:** PASS — Gate C satisfied with demo fallback rows.
