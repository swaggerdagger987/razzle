# Evidence — Lab sidebar search agent labels (2026-05-31)

**Atom:** `lab-sidebar-search-agent-labels`  
**Epic:** Lab L2 — sidebar groups launch-10 by agent owner (atom 2/2)

## Changes

- `LabSidebar.tsx` — when search query is active, each result title appends `· {agent.name}` in mono so the hallway band is visible in filtered results

## Commands

```text
npm run build --workspace=apps/web  → exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  → 59 passed, 4 failed (screener snapshot — pre-existing on base)
```

## Verdict

**PASS** — search surfaces agent ownership without opening a panel.
