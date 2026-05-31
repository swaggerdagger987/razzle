# Evidence — Lab L4 grid agent badges

**Date:** 2026-05-31  
**Slice:** `lab-grid-agent-badges` — agent avatars on `/lab` index grid cards  
**Verdict:** PASS (build + pytest)

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q   # 51 passed, 5 skipped
```

## UI check

- `/lab` grid cards show `agentForPanel` avatar (24×24, ink border) beside panel icon.
- `title` tooltip includes agent name + blurb (matches sidebar `SidebarItem` pattern).

## Files

- `apps/web/components/lab/LabSidebar.tsx` — `LabPanelGrid` only
- `apps/web/app/globals.css` — `.lab-grid-card-head`, `.lab-grid-agent`
