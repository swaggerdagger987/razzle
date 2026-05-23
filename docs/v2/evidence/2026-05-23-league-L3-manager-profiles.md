# League L3 — Manager Profiles (behavioral archetypes)

**Cycle:** 43  
**Commit:** (filled after commit)  
**Pillar:** League · **Layer:** L3

## Slice

Bureau `manager-profiles` feature — classify each manager from Sleeper transaction history into PANIC SELLER / AGGRESSIVE / HOARDER / PATIENT / STEADY with template exploit-window copy.

## Hallway checklist

| Check | Status |
|-------|--------|
| playerIdentityConsistent | N/A — league slice |
| leagueContextGlobal | ✅ Bureau requires connected league |
| agentPromptWired | ✅ Room prefill: manager + archetype → Bones |
| crossRoomLinkPresent | ✅ Room ask + trade-network footer |
| agentRegistryAligned | ✅ Bones via `agentForBureauSection` |
| dolphinReachable | N/A — injury not in slice |

## Routes

- `/league/[id]/manager-profiles`
- `POST /api/bureau/manager-profiles`

## Verification

```bash
JWT_SECRET=test-secret .venv-v2/bin/pytest apps/api/tests/test_bureau_manager_profiles.py -q
npm run build  # exit 0
```

## Reddit test

PANIC SELLER badge + "Strike after back-to-back losses" exploit copy — screenshot-worthy for trade negotiation group chats.
