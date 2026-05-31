# Evidence — lab-sidebar-staff-registry

**Date:** 2026-05-31  
**Atom:** `lab-sidebar-staff-registry` — expand `labPanels` in agent registry for Staff sidebar desks.

## Commands

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_lab_panel_agent_registry.py -q --noconftest
# 4 passed

npm run build --workspace=apps/web
# exit 0
```

## Change

`packages/agents/registry.ts` — launch-10 slugs + ~60 catalog panels mapped to Hawkeye/Octo/Bones/Atlas/Dolphin desks; Razzle keeps dashboard/screener/faab only.

## Verdict

PASS — Gate C N/A (registry-only); staff view groups fewer catch-alls under Razzle.
