# Explore L5 — Agent margin notes on screener rows

**Cycle:** 44  
**Commit:** e82bbdc7  
**Pillar:** Explore · **Layer:** L5

## Slice

NFL screener rows show one staff margin note when rules match — Dolphin durability (age cliffs) or Hawkeye usage (targets / youth breakout). Click note → Situation Room with agent + player prefill.

## Hallway checklist

| Check | Status |
|-------|--------|
| playerIdentityConsistent | ✅ Room link carries player id/name/pos |
| leagueContextGlobal | ✅ Context bar unchanged |
| agentPromptWired | ✅ Room `q=` includes note context |
| crossRoomLinkPresent | ✅ Explore row note → `/room` |
| agentRegistryAligned | ✅ AGENT_BY_ID avatars + copy |
| dolphinReachable | ✅ Age-based notes route to Dolphin |

## Routes

- `/explore` — Staff column (desktop) + margin line (mobile feed)

## Verification

```bash
npm run build  # exit 0
```

## Rules (client-side)

- RB/WR/TE age ≥ 28 → Dolphin "peak window closing"
- QB age ≥ 30 → Dolphin "vet QB — durability matters"
- targets ≥ 100 → Hawkeye "heavy target volume"
- age ≤ 22 and FPTS ≥ 180 → Hawkeye "youth breakout tape"
