# Evidence — Explore L5 Dolphin injury row chip

**Cycle:** 87  
**Atom:** `explore-l5-injury-row-chip`  
**Pillar:** Explore · **Layer:** L5

## Slice

NFL/college screener Staff column shows a compact Dolphin chip when `injury_status` /
`games_missed` flags the row. Chip links to Situation Room with Dolphin + player prefill.

## Verification

```bash
npm run build --workspace=apps/web   # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q   # 51 passed, 5 skipped
```

## Hallway

| Check | Status |
|-------|--------|
| dolphinReachable | ✅ injury chip → `/room` with `agentId=dolphin` |
| crossRoomLinkPresent | ✅ Explore Staff column |
| playerIdentityConsistent | ✅ player id/name/pos on Room link |

## Verdict

PASS — build + pytest green; UI slice (no OG curl required).
