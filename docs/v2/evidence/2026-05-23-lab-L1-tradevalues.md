# Evidence — Lab L1 Trade Values (`tradevalues`)

**Cycle:** 9  
**Route:** `/lab/tradevalues`

## Hallway checklist

| Check | Status |
|-------|--------|
| playerIdentityConsistent | ✅ Click player name → Player Sheet |
| leagueContextGlobal | ✅ Context bar (existing) |
| agentPromptWired | ✅ Bones Room prefill with player name |
| crossRoomLinkPresent | ✅ "Ask Bones about {top player}" |
| agentRegistryAligned | ✅ Bones header; `labPanels` includes `tradevalues` |
| dolphinReachable | N/A — trade panel; injury via Player Sheet |

## API

```
DEV_PLAN=elite GET /api/panels/tradevalues?limit=5 → 200, players[0].trade_value
```

## Verdict

PASS
