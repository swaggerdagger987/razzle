# Evidence — League L5 Head-to-Head

**Cycle:** 51  
**Commit:** 39f10f1  
**Slice:** League L5 — Head-to-Head opponent picker + Atlas rivalry renderer

## Acceptance

| Gate | Check | Result |
|------|-------|--------|
| 0 | pytest 54 pass | ✅ |
| 0 | npm run build | ✅ |
| 3 | H2H tab visible in Bureau nav | ✅ unhidden from `HIDDEN_BUREAU_SLUGS` |
| 3 | Opponent picker + compare UI | ✅ `BureauHeadToHead.tsx` |
| 3 | API returns managers + compare | ✅ `POST /api/bureau/head-to-head` |

## Hallway

| Check | Result |
|-------|--------|
| leagueContextGlobal | ✅ needs Sleeper user |
| agentPromptWired | ✅ Room ask with rivalry question |
| crossRoomLinkPresent | ✅ Trade Finder + Room via `toRoom` |
| agentRegistryAligned | ✅ Atlas `bureauSections` includes `head-to-head` |
| dolphinReachable | N/A injury surface |

## API smoke

```bash
curl -s -X POST localhost:8000/api/bureau/head-to-head \
  -H 'Content-Type: application/json' \
  -d '{"league_id":"<id>","user_id":"<uid>","opponent_user_id":"<oid>"}'
```

Returns: `managers`, `you`, `them`, `position_compare`, `trade_fit`.

## Files touched

- `apps/api/services/bureau/head_to_head.py` — managers list, optional opponent
- `apps/api/tests/test_bureau_head_to_head.py` — 3 unit tests
- `apps/web/components/league/BureauHeadToHead.tsx` — new renderer
- `apps/web/lib/bureau-features.ts` — unhide tab + endpoint
- `packages/agents/registry.ts` — Atlas owns head-to-head

## Reddit

Side-by-side rivalry card + depth bars — screenshot for group-chat trade negotiation threads.
