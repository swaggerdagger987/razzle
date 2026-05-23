# Evidence — Lab L1 dashboard (Cycle 17)

**Pillar:** Lab  
**Layer:** L1  
**Slice:** `dashboard` — Dynasty pulse check end-to-end

## API

```bash
curl -s localhost:8000/api/panels/dashboard | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['season'], d['total_players'], len(d['top5']), len(d['risers']))"
# 2025 390 5 8
```

## Routes

| Route | Verdict |
|-------|---------|
| `/lab/dashboard` | PASS — cards render, not JSON dump |
| Player Sheet → Dynasty Dashboard | PASS — typed link |
| Footer → `/room?from=dashboard&agent=razzle&q=...` | PASS |

## Hallway checklist

- [x] playerIdentityConsistent
- [x] leagueContextGlobal
- [x] agentPromptWired (from=dashboard → Cycle 18 completes prompt)
- [x] crossRoomLinkPresent
- [x] agentRegistryAligned (Razzle)
- [x] dolphinReachable — N/A

## Tests

- `pytest apps/api/tests -q` — 25 passed, 2 pre-existing snapshot fails
- `npm run build` — exit 0

**Verdict:** PASS
