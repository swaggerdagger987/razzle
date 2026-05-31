# Evidence — Lab L2 sidebar search agent labels

**Date:** 2026-05-31  
**Slice:** `lab-sidebar-search-agent-labels`  
**Atom:** 2/2 — closes Lab L2 sidebar epic on merge

## Acceptance

```text
npm run build --workspace=apps/web  → exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  → 58 passed, 5 skipped
```

## Change

- `SidebarItem` accepts `showAgentInTitle`; category search results render `Agent · Panel` labels (registry `agentForPanel`).

## Verdict

**PASS** — hallway nav scan during panel search.
