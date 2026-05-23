# Lab L3 — buy-sell formula sort

**Cycle:** 41  
**Commit:** 523d12b5  
**Pillar:** Lab · **Layer:** L3

## Slice

Explore screener composites feed Buy/Sell mismatch cards via `FormulaPanelBar` + `/api/players/compare`. Formula mode re-sorts buy-low DESC and sell-high ASC by composite score with formula column on cards.

## Hallway checklist

| Check | Status |
|-------|--------|
| playerIdentityConsistent | ✅ Player Sheet click on buy/sell cards |
| leagueContextGlobal | ✅ context bar unchanged |
| agentPromptWired | ✅ Bones Room ask includes composite name when active |
| crossRoomLinkPresent | ✅ FormulaPanelBar → `/explore`; Bones `toRoom` footer |
| agentRegistryAligned | ✅ Bones via `panelAgent('buysell')` |
| dolphinReachable | ✅ age on cards; Player Sheet injury path |

## Verification

| Gate | Result |
|------|--------|
| pytest | 35 passed, 2 pre-existing snapshot failures |
| npm run build | exit 0 |
| `/api/health` | 200 |
| `/lab/buysell` | FormulaPanelBar + composite sort on cards |

## Files touched

- `apps/web/components/lab/renderers/BuySellRenderer.tsx`
