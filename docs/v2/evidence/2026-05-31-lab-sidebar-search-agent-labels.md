# Evidence — lab-sidebar-search-agent-labels

**Date:** 2026-05-31  
**Atom:** Lab L2 epic atom 2/2 — search results show agent owner in sidebar title

## Change

- `apps/web/components/lab/LabSidebar.tsx` — `showOwnerInTitle` when sidebar search query is non-empty; visible label becomes `Hawkeye · Rankings` style via `agentForPanel`.

## Commands

```text
npm run build --workspace=apps/web  → exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  → 58 passed, 5 skipped
```

## Reality

PASS — UI-only; hallway H-04 agent ids unchanged; build + pytest green.
