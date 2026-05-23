# Evidence — Lab L1 efficiency (Cycle 14)

**Date:** 2026-05-23  
**Pillar:** Lab · **Layer:** L1 · **Slice:** `efficiency`

## Acceptance

| Check | Verdict |
|-------|---------|
| `/lab/efficiency` renders dual tables (not empty TableRenderer) | PASS |
| Position filter tabs | PASS |
| Player row → Player Sheet | PASS |
| Room Octo prefill on top efficient player | PASS |
| `npm run build` | PASS |

## API

```bash
run_panel('efficiency', {limit: 2, position: 'RB'})
# → most_efficient[0].ppo=1.21, volume_kings[0].name=Christian McCaffrey
```

## Hallway

- crossRoomLinkPresent: `toRoom(octo)` footer
- agentRegistryAligned: Octo header + existing `labPanels` includes `efficiency`

## Reddit test

PPO + grade columns = screenshot for "efficiency vs volume" dynasty threads.
