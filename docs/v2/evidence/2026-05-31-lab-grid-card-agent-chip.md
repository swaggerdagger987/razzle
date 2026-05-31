# Evidence — lab-grid-card-agent-chip

**Date:** 2026-05-31  
**Atom:** `lab-grid-card-agent-chip`  
**Cycle:** 124  
**Verdict:** PASS

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
JWT_SECRET=test-secret python3 -m pytest apps/api/tests -q   # 59 passed, 5 skipped
```

## Change

- `LabPanelGrid` shows `lab-grid-agent-chip` (avatar + agent name) on Launch-10 (`STAFF_PICKS`) cards at `/lab`.
- Matches sidebar Staff Picks agent ownership (Hawkeye, Octo, Bones, Atlas, Razzle).

## UI check

- Launch-10 slugs in `STAFF_PICKS` render chip above panel icon on index grid.
- Non–staff-pick panels unchanged (no chip).
