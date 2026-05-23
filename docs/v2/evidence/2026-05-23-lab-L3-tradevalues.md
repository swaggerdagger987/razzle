# Evidence — Lab L3 trade-values formula sort

**Cycle:** 40  
**Commit:** (filled after commit)  
**Pillar:** Lab · **Layer:** L3

## Slice

Explore screener composites feed Trade Values bar chart sort via `FormulaPanelBar` + `/api/players/compare`. Formula mode re-sorts position-colored bars by composite score with trade value reference.

## Hallway checklist

| Check | Status |
|-------|--------|
| playerIdentityConsistent | ✅ Player Sheet click on bar rows |
| leagueContextGlobal | ✅ context bar unchanged |
| agentPromptWired | ✅ Bones Room ask includes composite name when active |
| crossRoomLinkPresent | ✅ FormulaPanelBar → `/explore`; Bones `toRoom` footer |
| agentRegistryAligned | ✅ Bones via `panelAgent('tradevalues')` |
| dolphinReachable | ✅ N/A (no injury column in slice) |

## Verification

| Gate | Result |
|------|--------|
| pytest apps/api/tests -q | 35 passed, 2 pre-existing snapshot fails |
| npm run build | exit 0 |
| `/lab/tradevalues` | FormulaPanelBar + composite bar sort |

## Files touched

- `apps/web/components/lab/renderers/TradeValuesRenderer.tsx`
