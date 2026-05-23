# League L4 — Trade deadline pressure map

**Cycle:** 45  
**Commit:** 959d2436  
**Pillar:** League · **Layer:** L4

## Slice

Bureau pressure map tab — desperation scores 0–100 per manager from record + panic bursts + trade activity. Bones header, horizontal bars with desperate/motivated/comfortable labels, Room ask on hero manager.

## Hallway checklist

| Check | Status |
|-------|--------|
| playerIdentityConsistent | N/A — league slice |
| leagueContextGlobal | ✅ Bureau route requires connected league |
| agentPromptWired | ✅ Room prefill includes manager + pressure score |
| crossRoomLinkPresent | ✅ pressure-map ↔ manager-profiles ↔ trade-network |
| agentRegistryAligned | ✅ Bones via `agentForBureauSection("pressure-map")` |
| dolphinReachable | N/A injury slice; Player Sheet reachable from Explore |

## Routes

- `/league/[id]/pressure-map` — desperation bar chart

## Verification

```bash
JWT_SECRET=test-secret .venv-v2/bin/pytest apps/api/tests/test_bureau_pressure_map.py -q
npm run build  # exit 0
```

## API

```bash
curl -X POST localhost:8000/api/bureau/pressure-map \
  -H 'Content-Type: application/json' \
  -d '{"league_id":"<id>"}'
```
