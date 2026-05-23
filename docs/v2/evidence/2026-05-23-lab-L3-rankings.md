# Evidence — Lab L3 dynasty-rankings formula sort

**Cycle:** 39  
**Commit:** 107536ce  
**Pillar:** Lab · **Layer:** L3

## Slice

Explore screener composites (`razzle_formulas` localStorage) feed Dynasty Rankings sort via `FormulaPanelBar` + `/api/players/compare` stat fetch. Formula mode flattens API tiers into composite-sorted ranked list.

## Hallway checklist

| Check | Status |
|-------|--------|
| playerIdentityConsistent | ✅ Player Sheet click on sorted rows |
| leagueContextGlobal | ✅ context bar unchanged |
| agentPromptWired | ✅ Octo Room ask includes composite name when active |
| crossRoomLinkPresent | ✅ FormulaPanelBar → `/explore`; Octo `toRoom` footer |
| agentRegistryAligned | ✅ Octo via `panelAgent('rankings')` |
| dolphinReachable | ✅ durability → Dolphin on age ≥28 rows |

## Verification

| Gate | Result |
|------|--------|
| pytest apps/api/tests -q | 35 passed, 2 pre-existing snapshot fails |
| npm run build | exit 0 |
| `/lab/rankings` | FormulaPanelBar + composite flat sort |

## Files touched

- `apps/web/components/lab/renderers/DynastyRankingsRenderer.tsx`
