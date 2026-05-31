# Evidence — League L5 Manager Profiles OG Bones Room hallway

**Date:** 2026-05-31  
**Atom:** `league-og-manager-profiles-room-hallway`  
**Slice:** `/og/manager-profiles` watermark + Bones `toRoom` ask line

| Check | Result |
|-------|--------|
| Contract test | `test_manager_profiles_og_room_hallway.py` PASS |
| Route 200 | `curl localhost:3000/og/manager-profiles?download=1` → 200 |
| PNG size | 76684 bytes (≥40KB) |
| Hallway | `toRoom` bones + `panelSlug: manager-profiles` + terracotta watermark |

**Verdict:** PASS — Gate C satisfied with demo fallback rows.
