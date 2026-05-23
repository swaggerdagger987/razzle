# Evidence — League L5 Scenario Trade

**Cycle:** 52  
**Commit:** (after Phase 5)  
**Slice:** League L5 — Monte Carlo what-if trade re-simulation

## Acceptance

| Check | Result |
|-------|--------|
| pytest 56 pass | ✅ |
| npm run build | ✅ |
| POST /api/bureau/scenario-trade | ✅ baseline + scenario + delta |
| Trade Finder → monte-carlo ?give=&get=&partner= | ✅ hallway link |
| What-if delta card on BureauMonteCarlo | ✅ |

## Hallway

| Check | Result |
|-------|--------|
| crossRoomLinkPresent | ✅ Trade Finder → Monte Carlo → Room |
| agentPromptWired | ✅ Octo ask with delta context |
| agentRegistryAligned | ✅ Octo owns monte-carlo |

## Reddit

"Title odds +4.2% if you send X for Y" — bot-fact and screenshot-worthy trade debate reply.
