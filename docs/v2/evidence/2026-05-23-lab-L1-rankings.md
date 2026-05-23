# Evidence — Lab L1 Dynasty Rankings (`rankings`)

**Cycle:** 8  
**Pillar:** Lab  
**Layer:** L1  
**Route:** `/lab/rankings`

## Hallway checklist

| Check | Status | Evidence |
|-------|--------|----------|
| playerIdentityConsistent | ✅ | Click player name in tier → Player Sheet opens with player_id |
| leagueContextGlobal | ✅ | Context bar unchanged; league flows via existing sleeper.ts |
| agentPromptWired | ✅ | Room links use `toRoom({ agentId, question })` with player name |
| crossRoomLinkPresent | ✅ | Footer "Ask Octo about {top player}" → `/room?agent=octo&q=...` |
| agentRegistryAligned | ✅ | Octo header from `@razzle/agents`; `labPanels` includes `rankings` |
| dolphinReachable | ✅ | Age ≥28 players show "durability →" Dolphin Room link |

## API

```bash
DEV_PLAN=elite curl -s 'localhost:8000/api/panels/rankings?limit=10&position=WR' | jq '.total, .players[0].full_name, .players[0].dynasty_value'
# 10, "Puka Nacua", 91.9
```

Free plan: `402 upgrade_required`

## UI

- Octo agent header + position filter (All/QB/RB/WR/TE)
- Tier blocks with dynasty_value, age, position pills
- Player Sheet Panels tab → Dynasty Rankings, Trade Values, Ask Octo
- OG export: `/og/rankings?download=1`

## Verdict

PASS — Lab L1 panel #3 (`dynasty-rankings` / slug `rankings`) screenshot-worthy.
