# Evidence — Lab L1 buy/sell (Cycle 16)

## Slice
- **Route:** `/lab/buysell`
- **Pillar:** Lab L1 launch panel #9
- **Agent:** Bones (Diplomat)

## API
```bash
JWT_SECRET=test python -c "
from apps.api.services.panels.dispatcher import run_panel
r = run_panel('buysell', {})
print('buy', len(r['buy_low']), 'sell', len(r['sell_high']))
print('top buy', r['buy_low'][0]['name'], r['buy_low'][0]['mismatch_score'])
"
```

## Hallway checklist
| Check | Status |
|-------|--------|
| playerIdentityConsistent | Card click → Player Sheet |
| leagueContextGlobal | Context bar (unchanged) |
| agentPromptWired | Room footer: buy + sell Bones prefills with mismatch stats |
| crossRoomLinkPresent | Player Sheet panels → `/lab/buysell`; footer → Room |
| agentRegistryAligned | `bones.labPanels` includes `buysell` |
| dolphinReachable | N/A — trade panel |

## Verdict
**PASS**
